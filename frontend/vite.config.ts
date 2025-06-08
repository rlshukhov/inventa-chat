import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: './', // assets relative path
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})