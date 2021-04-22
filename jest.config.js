module.exports = {
  verbose: true,
  roots: ['test'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testEnvironment: 'node',
  testTimeout: 20000
}