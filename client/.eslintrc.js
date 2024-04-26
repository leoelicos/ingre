module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['react-app'],
  plugins: ['@typescript-eslint', 'react-hooks', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      { '': 'never', ts: 'never', tsx: 'never' }
    ]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
