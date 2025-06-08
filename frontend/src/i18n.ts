import { createI18n } from 'vue-i18n'
import ru from './locales/ru.json'
import en from './locales/en.json'

export const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'ru',
    messages: {
        en,
        ru
    }
})
