import globals from 'globals';
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            'dist',
            'node_modules',
            'eslint.config.mjs',
            // 'tests/',
            // '*.spec.ts',
            '.github',
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'jest.config.js',
                        'eslint.config.mjs',
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.jest,
            },
        },
        rules: {
            // 'no-console': 'error',
        },
    },
);
