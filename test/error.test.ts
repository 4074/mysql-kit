import mk from '../src'

describe('Error', () => {
  test('No pool', async () => {
    expect.assertions(1)
    try {
      await mk.query('show tables')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})