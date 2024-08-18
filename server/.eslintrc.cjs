module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['typescript-eslint'],
  extends: ['prettier'],
  rules: {
    quotes: [2, 'single'],
    'no-console': 'off',
    'no-duplicate-imports': 2,
    'object-literal-sort-keys': 0,
    'no-trailing-whitespace': 0,
    'max-classes-per-file': [2, 15]
  }
};
