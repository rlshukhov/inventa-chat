import {KeyValueDatabase} from "@/lib/database.ts";
import {Model} from "@/models/ai/models.ts";

export type ProviderStorageKeys = 'bearer-token';

interface ProviderStorage {
    get: (key: ProviderStorageKeys) => Promise<string | null>
    set: (key: ProviderStorageKeys, value: string) => Promise<void>
}

const BearerTokenHeader = async (storage: ProviderStorage): Promise<string | null> => {
    return storage.get('bearer-token').then(token => {
        if (token) {
            return `Bearer ${token}`;
        }
        return null;
    });
};

export class ProviderAPI {
    public baseURL: string;
    public headers: Record<string, (storage: ProviderStorage) => Promise<string | null>>;

    public modelsUrl: string | null;
    public chatCompletionUrl: string;
    public availabilityCheckUrl: string;

    constructor(
        baseURL: string,
        headers: Record<string, (storage: ProviderStorage) => Promise<string | null>>,
        modelsUrl: string | null = '/models',
        availabilityCheckUrl: string | null = null,
        chatCompletionUrl: string = '/chat/completions',
    ) {
        this.baseURL = baseURL;
        this.headers = headers;

        this.modelsUrl = modelsUrl;
        this.chatCompletionUrl = chatCompletionUrl;
        this.availabilityCheckUrl = availabilityCheckUrl ?? modelsUrl!;
    }

    public async buildHeaders(storage: ProviderStorage|Record<ProviderStorageKeys, string>): Promise<Record<string, string>> {
        let realStorage: ProviderStorage;
        if (typeof storage === 'object' && !('get' in storage) && !('set' in storage)) {
            const record: Record<ProviderStorageKeys, string> = storage;
            realStorage = {
                get: (key: ProviderStorageKeys): Promise<string|null> => Promise.resolve(record[key] || null),
                set: (key: ProviderStorageKeys, value: string): Promise<void> => {
                    record[key] = value;
                    return Promise.resolve();
                },
            };
        } else {
            realStorage = storage as ProviderStorage;
        }

        const headers: Record<string, string> = {};
        for (const name in this.headers) {
            const callback = this.headers[name];
            const value = await callback(realStorage);
            if (value) {
                headers[name] = value;
            }
        }

        return headers;
    }
}

export type ProviderID = 'openai' | 'deepseek' | 'perplexity' | 'openrouter';

export interface ProviderDefinition {
    id: ProviderID;
    title: string;
    description?: string;
    logo?: URL;
    api: ProviderAPI;
    featuredModels: string[];
    outputFormatter?: (content: string, data: any) => string;
    availabilityChecker?: (storage: ProviderStorage) => Promise<boolean>;
}

export class Provider implements ProviderDefinition {
    id: ProviderID;
    title: string;
    description?: string;
    logo?: URL;
    api: ProviderAPI;
    featuredModels: string[];
    outputFormatter?: (content: string, data: any) => string;
    availabilityChecker: (storage: ProviderStorage) => Promise<boolean>;

    storage: ProviderStorage;
    models: Model[];

    protected constructor(
        name: ProviderID,
        title: string,
        api: ProviderAPI,
        featuredModels: string[],
        outputFormatter?: (content: string, data: any) => string,
        availabilityChecker?: (storage: ProviderStorage) => Promise<boolean>,
        description?: string,
        logo?: URL,
    ) {
        this.id = name;
        this.title = title;
        this.description = description;
        this.logo = logo;
        this.api = api;
        this.featuredModels = featuredModels;
        this.outputFormatter = outputFormatter;
        this.availabilityChecker = availabilityChecker ?? (async (storage: ProviderStorage): Promise<boolean> => {
            const token = await storage.get('bearer-token');
            return !!token && token.length > 0;
        });

        this.storage = providersStorage.getForProvider(this.id);
        this.models = this.featuredModels.map((featuredModel) => {
            return new Model(this.id, featuredModel, `${this.title} — ${featuredModel}`);
        });
    }

    public static fromDefinition(definition: ProviderDefinition): Provider {
        return new Provider(
            definition.id,
            definition.title,
            definition.api,
            definition.featuredModels,
            definition.outputFormatter,
            definition.availabilityChecker,
            definition.description,
            definition.logo,
        );
    }

    public async isAvailable(): Promise<boolean> {
        return this.availabilityChecker(this.storage);
    }
}

const providersStorage = {
    getForProvider: (providerName: ProviderID): ProviderStorage => {
        return new class extends KeyValueDatabase<string> {
            public constructor(providerName: ProviderID) {
                super(`ProviderStorage-${providerName}`);
            }

            public async get(key: ProviderStorageKeys): Promise<string | null> {
                return super.get(key);
            }

            public async set(key: ProviderStorageKeys, value: string): Promise<void> {
                return super.set(key, value);
            }
        }(providerName);
    },
};

const defaultProviderDefinitions: ProviderDefinition[] = [
    {
        id: 'openai',
        title: 'OpenAI',
        api: new ProviderAPI(
            'https://api.openai.com/v1',
            {
                'Authorization': BearerTokenHeader,
            },
        ),
        featuredModels: ['gpt-4.1-mini', 'gpt-4.1-nano'],
    },
    {
        id: 'deepseek',
        title: 'DeepSeek',
        api: new ProviderAPI(
            'https://api.deepseek.com/v1',
            {
                'Authorization': BearerTokenHeader,
            },
        ),
        featuredModels: ['deepseek-chat', 'deepseek-reasoner'],
    },
    {
        id: 'perplexity',
        title: 'Perplexity',
        api: new ProviderAPI(
            'https://api.perplexity.ai',
            {
                'Authorization': BearerTokenHeader,
            },
            null,
            '/async/chat/completions',
        ),
        featuredModels: ['sonar', 'sonar-pro'],
        outputFormatter: (content: string, data: any) => {
            const links = data.citations ?? null;
            if (!links || !Array.isArray(links)) {
                return content;
            }

            let newText = content.replace(
                /\[(\d+)]/g,
                (_, group) => ` [^${group}]`,
            );
            if (links && links.length > 0) {
                let linkIndex = 0;
                newText += '\n\n' + links.map(() => {
                    const link = links[linkIndex++];
                    return `[^${linkIndex}]: ${link}`;
                }).join('\n');
            }

            return newText;
        },
    },
    {
        id: 'openrouter',
        title: 'OpenRouter',
        api: new ProviderAPI(
            'https://openrouter.ai/api/v1',
            {
                'Authorization': BearerTokenHeader,
            },
        ),
        featuredModels: ['qwen/qwen3-14b', 'qwen/qwen-2.5-coder-32b-instruct', 'meta-llama/llama-3.3-70b-instruct', 'qwen/qwen3-235b-a22b', 'x-ai/grok-3-beta', 'anthropic/claude-sonnet-4', 'google/gemini-2.5-flash', 'google/gemini-2.5-pro'],
    },
];

export const providers = defaultProviderDefinitions.map((providerDefinition) => {
    return Provider.fromDefinition(providerDefinition);
});

export const providerIds: ProviderID[] = providers.map(provider => provider.id);

export const providersByName: Record<ProviderID, Provider> = providers.reduce((acc, provider) => {
    acc[provider.id] = provider;
    return acc;
}, {} as Record<ProviderID, Provider>);

export const getModelByUid = (uid: string): Model | null => {
    for (const provider of providers) {
        if (!uid.startsWith(provider.id + ':')) {
            continue;
        }

        const modelId = uid.slice(provider.id.length + 1);
        const model = provider.models.find(m => m.id === modelId);
        if (model) {
            return model;
        }
    }

    return null;
};
