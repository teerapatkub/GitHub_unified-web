import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    files: ['server.js', 'arcade/**/*.js', 'auth/**/*.js', 'runtime/**/*.js', 'security/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Legacy server.js still has these warnings. The fixed warning budget
      // prevents new instances while more focused cleanups reduce the baseline.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
      'no-control-regex': 'warn',
      'no-useless-catch': 'warn',
    },
  },
];
