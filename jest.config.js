/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // verbose: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/*.{ts,ts}'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src',
  },
  moduleDirectories: ['node_modules', 'src'],
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/'],
};
