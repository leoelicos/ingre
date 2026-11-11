/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  globals: { __APP_MODE__: 'test', __GRAPHQL_URL__: '' },
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
      '<rootDir>/node_modules/react-router/dist/development/dom-export.js',
    /* jsdom picks the package's ESM "browser" build; Jest runs CommonJS (#177) */
    '^@vercel/analytics/react$':
      '<rootDir>/node_modules/@vercel/analytics/dist/react/index.js',
    /* cobe is ESM-only; tests never need a real globe */
    '^cobe$': '<rootDir>/src/test/cobeMock.js'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/setupTests.ts'],
  resetMocks: true,
  /* The axe and full-list tests run 3-5s locally and slower on CI runners; 5s (the default) flaked on main after #299/#302 */
  testTimeout: 20000
}
