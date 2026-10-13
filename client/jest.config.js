/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/src/test/fetchPolyfill.js'],
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
          isolatedModules: true,
          resolveJsonModule: true
        }
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
