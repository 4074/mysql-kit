import mk from '../src'

interface Animal {
  id?: number
  type: string
  name: string
  age: number
  status: number
}

const testTableName = 'animals'

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: '__mysql_kit_test__'
}

beforeAll(() => {
  mk.connect(config)
})

describe('mysql kit', () => {
  test('Show tables', async () => {
    const r = await mk.query('show tables')
    expect(Array.isArray(r)).toBe(true)
  })

  test('Create test table', async () => {
    await mk.query(`drop table if exists ${testTableName}`)
    await mk.query(`
      CREATE TABLE \`animals\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`type\` varchar(100) NOT NULL,
        \`name\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
        \`age\` int DEFAULT NULL,
        \`status\` int NOT NULL DEFAULT '1',
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `)
    const r = await mk.query<any[]>('show tables')
    expect(
      r.some(item => item[`Tables_in_${config.database}`] === testTableName)
    ).toBe(true)
  })

  test('Insert', async () => {
    const r = await mk.insert<Animal>(testTableName, [{
      type: 'cat',
      name: 'Tom',
      age: 2,
      status: 1
    }, {
      type: 'cat',
      name: 'Jack',
      age: 3,
      status: 1
    }])

    expect(r.affectedRows).toBe(2)
  })

  test('1', () => {
    expect(1).toBe(1)
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