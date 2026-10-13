module.exports = {
  roots: ['<rootDir>/src'],
  maxWorkers: '80%',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js'],
  coveragePathIgnorePatterns: ['src/(.*)/(.*).d.ts', 'src/schemas/typeDefs.ts'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testPathIgnorePatterns: ['/node_modules/']
}
