export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/Tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|svg|webp)$': '<rootDir>/src/Tests/Mocks/fileMock.js',
  },
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  testMatch: ['**/Tests/**/*.test.{js,jsx}'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/main.jsx', '!src/Tests/**'],
};