import { createApp, watch } from 'vue'
import './style.css'
import App from './ChatView.vue'
import { i18n } from './i18n'
import 'highlight.js/styles/monokai-sublime.min.css'
import { getLocale, saveLocale } from './data/chatDatabase.ts'

async function setup() {
    // language setting
    i18n.global.locale.value = await getLocale()

    const app = createApp(App)
    app.use(i18n)

    window.__t = (key: string) => i18n.global.t(key)

    // change language
    watch(i18n.global.locale, async (newLocale) => {
        window.__t = (key: string) => i18n.global.t(key)
        await saveLocale(newLocale)
    })

    app.mount('#app')
}

(async () => {
    await setup();
})();

