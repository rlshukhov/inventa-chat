import pluginVue from 'eslint-plugin-vue';
import {
    defineConfigWithVueTs,
    vueTsConfigs,
    configureVueProject,
} from '@vue/eslint-config-typescript';
import { globalIgnores } from "eslint/config";

configureVueProject({
    tsSyntaxInTemplates: true,
    scriptLangs: [
        'ts',
        'js',
    ],
    rootDir: import.meta.dirname,
});

export default defineConfigWithVueTs(
    pluginVue.configs["flat/essential"],
    vueTsConfigs.recommendedTypeChecked,
    globalIgnores([
        'node_modules/**',
        'dist/**',
        'src/components/ui/**',
        'public/**',
    ]),
    {
        rules: {
            'semi': ['error', 'always'],
            'curly': ['error', 'all'],
            'comma-dangle': ['error', 'always-multiline'],
            '@/brace-style': ['error', '1tbs'],
            '@typescript-eslint/no-explicit-any': 'off',
            'vue/multi-word-component-names': "off",
        },
    },
);