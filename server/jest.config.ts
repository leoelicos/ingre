// module.exports = {
//   roots: ['<rootDir>/src'], // Update to point to your source directory
//   collectCoverage: true,
//   collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
//   transform: {
//     '^.+\\.(tsx|ts)?$': 'ts-jest'
//   },
//   testRegex: '(/__tests__/.*|.*(\\.|/)(test|spec))\\.ts$',
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
//   coveragePathIgnorePatterns: ['src/(.*)/(.*).d.ts', 'src/(.*).stories.tsx', 'src/(.*)/(.*).stories.tsx', 'node_modules/(.*)']
// };

module.exports = {
  // roots: ['<rootDir>/src'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coveragePathIgnorePatterns: ['src/(.*)/(.*).d.ts', 'src/(.*).stories.tsx', 'src/(.*)/(.*).stories.tsx', 'node_modules/(.*)']
};
