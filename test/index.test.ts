import mk from '../src'

const testTableName = 'animals'

beforeAll(() => {
  mk.connect({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: '__mysql_kit_test__'
  })
})

describe('mysql kit', () => {
  test('Show tables', async () => {
    const r = await mk.query('show tables')
    expect(Array.isArray(r)).toBe(true)
  })
})

afterAll(done => {
  const pool = mk.getPool()
  if (pool) {
    pool.end(done)
  } else {
    done()
  }
})