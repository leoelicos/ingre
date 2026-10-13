const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  roots: ['<rootDir>/src'],
  // silent: true,
  maxWorkers: '80%',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js'],
  coveragePathIgnorePatterns: ['src/(.*)/(.*).d.ts', 'src/schemas/typeDefs.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src'
  }),
  testEnvironment: 'node',
  // Skip DB-dependent tests for now (they require a running MongoDB)
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/datasources/category.test.ts',
    'src/datasources/recipe.test.ts',
    'src/datasources/user.test.ts',
    'src/datasources/ingredient.test.ts',
    'src/utils/auth.test.ts'
  ]
}
