module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(ts|js)'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
