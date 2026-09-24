export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|svg|webp)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
  },
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  testMatch: ['**/tests/**/*.test.{js,jsx}'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/main.jsx', '!src/tests/**'],
};