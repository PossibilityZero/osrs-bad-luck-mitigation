import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    env: {
      jest: true,
      browser: true,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
];
