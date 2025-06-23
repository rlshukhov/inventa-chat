import {KeyValueDatabase} from "@/lib/database.ts";
import type {Language, SettingsDefinition} from "@/models/settings.ts";
import {eventBus} from "@/eventBus.ts";

type SettingsStorageKeys = 'locale' | 'last_used_model_uid';

class SettingsStorage extends KeyValueDatabase<string> {
    public constructor() {
        super('SettingsStorage');

        eventBus.on('aiModelUsed', (model) => {
            this.set('last_used_model_uid', model.uid).catch(console.error);
        });
    }

    public async get(key: SettingsStorageKeys): Promise<string | null> {
        return super.get(key);
    }

    public async set(key: SettingsStorageKeys, value: string): Promise<void> {
        return super.set(key, value);
    }
}

export class Settings implements SettingsDefinition {
    public locale: Language = 'ru';
    public lastUsedModelUid?: string;

    private storage: SettingsStorage;

    public constructor() {
        this.storage = new SettingsStorage();
        void this.loadSettings();
    }

    public async loadSettings(): Promise<void> {
        const locale = await this.storage.get('locale');
        if (locale === 'en' || locale === 'ru') {
            this.locale = locale as Language;
        } else {
            this.locale = 'ru';
        }

        const lastUsedModelUid = await this.storage.get('last_used_model_uid');
        if (lastUsedModelUid) {
            this.lastUsedModelUid = lastUsedModelUid;
        }
    };

    public async setLocale(locale: Language): Promise<void> {
        this.locale = locale;
        await this.storage.set('locale', locale);
    }

    public async setLastUsedModelUid(uid: string): Promise<void> {
        this.lastUsedModelUid = uid;
        await this.storage.set('last_used_model_uid', uid);
    }
}

export const settings = new Settings();
