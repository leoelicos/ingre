module.exports = {
  roots: ['<rootDir>/src'],
  maxWorkers: '80%',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js'],
  // Firebase Auth: firebase-admin needs require(esm), which Jest's runtime lacks
  moduleNameMapper: {
    '^firebase-admin/app$': '<rootDir>/src/test-utils/firebaseAdminApp.ts',
    '^firebase-admin/auth$': '<rootDir>/src/test-utils/firebaseAdminAuth.ts'
  },
  coveragePathIgnorePatterns: ['src/(.*)/(.*).d.ts', 'src/schemas/typeDefs.ts'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testPathIgnorePatterns: ['/node_modules/']
}
