import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-control-regex': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-case-declarations': 'off',
      'no-useless-assignment': 'warn',
    },
  },
  // Source .ts files are type-checked via `tsc --noEmit` (strict mode).
  // To lint them with ESLint too, add @typescript-eslint/parser + plugin.
  {
    ignores: ['dist/', 'node_modules/', '.wrangler/'],
  },
];
