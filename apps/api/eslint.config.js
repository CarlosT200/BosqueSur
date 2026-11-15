import globals from 'globals';

export default [
  {
    ignores: ['src/generated/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off',
      'prefer-const': 'warn',
      eqeqeq: ['warn', 'smart'],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
