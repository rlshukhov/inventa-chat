export type Language = 'en' | 'ru';

export interface SettingsDefinition {
    locale: Language;
    lastUsedModelUid?: string;
    sendOnEnter: boolean;
}