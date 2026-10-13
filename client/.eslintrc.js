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
