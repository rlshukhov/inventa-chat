import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

import {defineConfig} from 'vite';
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: false,
            },
            manifest: {
                name: 'Inventa Chat',
                short_name: 'Inventa',
                description: 'Cross-platform OpenAI API compatible chat application',
                background_color: '#000000',
                theme_color: '#000000',
                icons: [
                    {
                        src: 'icon-256x256.png',
                        sizes: '256x256',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 5000000,
            },
            injectManifest: {
                maximumFileSizeToCacheInBytes: 5000000,
            },
        }),
    ],
    base: './', // assets relative path
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        target: 'es2022',
    },
});