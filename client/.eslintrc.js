/** i18next and react-i18next are imported in src/i18n only; everything else uses its helpers. */
const I18N_MESSAGE =
  'Use the helpers in src/i18n (translate, useT, formatQuantity, ...) instead.'
const I18N_ONLY = {
  paths: [
    { name: 'i18next', message: I18N_MESSAGE },
    { name: 'react-i18next', message: I18N_MESSAGE }
  ],
  patterns: [{ group: ['i18next/*', 'react-i18next/*'], message: I18N_MESSAGE }]
}

module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true, jest: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  extends: [
    'plugin:import/typescript',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    // roughly mirrors the subset of rules eslint-config-react-app enforced
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-vars': 'warn',
    'react/jsx-uses-react': 'warn',
    'react/no-danger-with-children': 'warn',
    'react/jsx-no-target-blank': 'warn',
    'import/first': 'error',
    'import/no-anonymous-default-export': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    // i18n: only src/i18n talks to the library, so it can be swapped
    'no-restricted-imports': ['error', I18N_ONLY],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        '': 'never',
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never'
      }
    ]
  },
  overrides: [
    {
      files: ['src/i18n/**'],
      rules: { 'no-restricted-imports': 'off' }
    },
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-explicit-any': 'error'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] }
    }
  }
}
