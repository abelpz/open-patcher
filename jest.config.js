module.exports = {
  displayName: 'open-patcher',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },
  moduleNameMapper: {
    '^open-patcher/?(.*)': '<rootDir>/lib/$1',
  },
};
