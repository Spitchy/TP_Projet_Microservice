module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
    '!src/__tests__/**',
    '!src/utils/seed.js',
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
  ],
  // thresholds intentionally low until more tests are added
  coverageThreshold: {
    global: {
      lines: 50,
      functions: 35,
      branches: 40,
      statements: 50,
    },
  },
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  verbose: true,
  testTimeout: 10000,
};
