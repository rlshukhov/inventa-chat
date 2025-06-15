import Dexie, { type Table } from 'dexie';
import {eventBus} from "@/eventBus.ts";
import type {Model, ProviderRaw} from "@/aiService.ts";

export interface ChatMessage {
    id?: number;
    dialogueId: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: number;
    model: string | null;
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
export async function saveSelectedModel(model: Model) {
    await db.settings.put({ key: 'selected_model', value: [model.provider, model.id].join('_') });
    eventBus.emit('selectedModelUpdate', model);
}

export async function getSelectedModel(): Promise<Model|null> {
    const setting = await db.settings.get('selected_model');
    if (!(setting?.value)) {
        return null
    }

    return {id: setting.value.split('_')[1], provider: setting.value.split('_')[0] as ProviderRaw}
}

export async function getApiKey(provider: ProviderRaw): Promise<string> {
    const setting = await db.settings.get(provider);
    return setting?.value || '';
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