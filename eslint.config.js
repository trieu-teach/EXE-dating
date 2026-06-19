import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'scripts/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Co-locating hooks/components in the same file is convenient; tolerate.
      'react-refresh/only-export-components': 'off',
      // React 19 ships the new set-state-in-effect rule, which we deliberately
      // use in places where it doesn't matter (one-shot bootstrapping).
      'react-hooks/set-state-in-effect': 'off',
      // Allow hooks to depend on values via arrays of any expression.
      'react-hooks/exhaustive-deps': 'warn',
      // Console logs are useful while debugging the API integration.
      'no-console': 'off',
      // Allow underscore-prefixed args to remain.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])
