import Dexie, { type Table } from 'dexie';

export interface ChatMessage {
    id?: number;
    dialogueId: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: number;
}

export interface Setting {
    key: string;
    value: string;
}

export interface Dialogue {
    id: string;
    title: string;
    messages: ChatMessage[];
}

class ChatDatabase extends Dexie {
    messages!: Table<ChatMessage, number>;
    dialogues!: Table<Omit<Dialogue, 'messages'>, string>;
    settings!: Table<Setting, string>;

    constructor() {
        super('ChatDatabase');
        this.version(1).stores({
            dialogues: 'id',
            messages: '++id, dialogueId, timestamp',
            settings: 'key'
        });
    }
}

// settings

export async function saveApiKey(provider: 'gpt' | 'deepseek'| 'perplexity', key: string) {
    await db.settings.put({ key: provider, value: key });
}
export async function saveSelectedModel(provider: 'gpt' | 'deepseek'| 'perplexity', model: string) {
    await db.settings.put({ key: `model_${provider}`, value: model });
}

export async function getSelectedModel(provider: 'gpt' | 'deepseek'| 'perplexity'): Promise<string> {
    const setting = await db.settings.get(`model_${provider}`);
    return setting?.value || '';
}

export async function getApiKey(provider: 'gpt' | 'deepseek'| 'perplexity'): Promise<string> {
    const setting = await db.settings.get(provider);
    return setting?.value || '';
}

export async function saveSelectedProvider(provider: 'gpt' | 'deepseek'| 'perplexity') {
    await db.settings.put({ key: 'selectedProvider', value: provider });
}

export async function getSelectedProvider(): Promise<'gpt' | 'deepseek' | 'perplexity' | ''> {
    const setting = await db.settings.get('selectedProvider');
    return (setting?.value as 'gpt' | 'deepseek') || '';
}

// language

export type Locale = 'en' | 'ru';

export async function saveLocale(locale: Locale) {
    await db.settings.put({ key: 'locale', value: locale });
}

export async function getLocale(): Promise<Locale> {
    const setting = await db.settings.get('locale');
    const value = setting?.value;

    if (value === 'en' || value === 'ru') {
        return value;
    }
    return 'ru';
}

export const db = new ChatDatabase();