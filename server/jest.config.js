const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  roots: ['<rootDir>/src'],
  // silent: true,
  maxWorkers: '80%',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  // testMatch: ['**/src/datasources/recipe.test.ts'],
  // collectCoverageFrom: ['src/datasources/recipe.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js'],
  coveragePathIgnorePatterns: ['src/(.*)/(.*).d.ts', 'src/schemas/typeDefs.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src'
  }),
  testEnvironment: 'node'
}
