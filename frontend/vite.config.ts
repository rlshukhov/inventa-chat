import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import {defineConfig} from 'vite'
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
                theme_color: '#FFFFFF',
                icons: [
                    {
                        src: 'icon-256x256.png',
                        sizes: '256x256',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
    base: './', // assets relative path
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})