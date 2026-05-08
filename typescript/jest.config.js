module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    '*.ts',
    '!node_modules/**',
    '!__tests__/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};