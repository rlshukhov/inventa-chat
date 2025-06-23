import {createApp, watch} from 'vue';
import './styles/base.css';
import App from './ChatView.vue';
import {i18n} from './locales/i18n.ts';
import 'highlight.js/styles/github-dark.min.css';
import {settings} from "@/lib/services/settings.ts";
import {targetOS} from "@/lib/services/target.ts";

console.log('Target OS: ', import.meta.env.VITE_TARGET_OS);

async function setup(): Promise<void> {
    await settings.loadSettings();

    // language setting
    i18n.global.locale.value = settings.locale;

    const app = createApp(App);
    app.use(i18n);

    window.__t = (key: string) => i18n.global.t(key);

    // change language
    watch(i18n.global.locale, (newLocale) => {
        window.__t = (key: string) => i18n.global.t(key);
        void settings.setLocale(newLocale);
    });

    app.mount('#app');
}

await setup();

if (targetOS === "darwin") {
    await import('./styles/darwin.css');
}

document.documentElement.classList.add(targetOS);

