/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['react-app-polyfill/jsdom'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          rootDir: 'src',
          module: 'commonjs',
          esModuleInterop: true,
          jsx: 'react-jsx',
          isolatedModules: true
        }
      }
    ],
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: ['react-app']
      }
    ]
  },
  moduleNameMapper: {
    '\\.(css|scss|sass)$': '<rootDir>/src/test/styleMock.js',
    '^react-router/dom$':
      '<rootDir>/node_modules/react-router/dist/development/dom-export.js'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/setupTests.ts'],
  resetMocks: true
}
