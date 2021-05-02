import mk from '../src'
import { pickValues } from '../src/tools'
import config from './config'

interface Animal {
  id?: number
  type: string
  name: string
  age: number
  status: number
}

const testTableName = 'animals'
const isValuesEqual = <T>(a: T, b: T, keys: (keyof T)[]) => {
  for (const key of keys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

beforeAll(() => {
  mk.connect(config)
})

describe('mysql kit', () => {
  test('query', async () => {
    const r = await mk.query('show tables')
    expect(Array.isArray(r)).toBe(true)
  })

  test('query using callback', (done) => {
    expect.assertions(2)
    mk.query('show tables', (err: Error, r: any) => {
      expect(err).toBeNull()
      expect(Array.isArray(r)).toBe(true)
      done()
    })
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

  test('insert', async () => {
    const r = await mk.insert<Animal>(testTableName, [{
      type: 'cat',
      name: 'Tom?',
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

  test('insert just one', async () => {
    const r = await mk.insert<Animal>(testTableName, {
      type: 'cat',
      name: 'Mew~',
      age: 2,
      status: 1
    })

    expect(r.affectedRows).toBe(1)
  })

  test('insertAndFind', async () => {
    const source: Animal = {
      type: 'dog',
      name: Math.random().toString().slice(-8),
      age: 2,
      status: 1
    }
    const r = await mk.insertAndFind(testTableName, source)

    expect(isValuesEqual(source, r, ['type', 'name', 'age', 'status'])).toBe(true)
  })

  test('insertAndFind with id', async () => {
    const source: Animal = {
      id: -1,
      type: 'dog',
      name: Math.random().toString().slice(-8),
      age: 2,
      status: 1
    }
    const r = await mk.insertAndFind(testTableName, source)

    expect(isValuesEqual(source, r, ['type', 'name', 'age', 'status'])).toBe(true)
  })

  test('find', async () => {
    const r = await mk.find<Animal>(testTableName, { type: 'dog' })
    expect(r.length).toBe(2)
    expect(r[0].type).toBe('dog')
    expect(r[1].type).toBe('dog')
  })

  test('find without conditions', async () => {
    const r = await mk.find<Animal>(testTableName)
    expect(r.length).toBeGreaterThanOrEqual(4)
  })

  test('find with array', async () => {
    const r = await mk.find<Animal>(testTableName, { type: ['dog'] })
    expect(r.length).toBe(2)
    expect(r[0].type).toBe('dog')
  })


  test('findOne', async () => {
    const r = await mk.findOne(testTableName, { type: 'dog' })
    expect(r.type).toBe('dog')
  })

  test('findOneById', async () => {
    const r = await mk.findOneById<Animal>(testTableName, 1)
    expect(r.id).toBe(1)
  })

  test('findOneByQuery', async () => {
    const r = await mk.findOneByQuery(
      `select * from ${testTableName} where type=:type`,
      { type: 'cat' }
    )
    expect(r.id).toBe(1)

    const q = await mk.findOneByQuery(
      `select * from ${testTableName} where type=:type`,
      { type: 'xxx' }
    )
    expect(q).toBeUndefined()

    const p = await mk.findOneByQuery(`drop table if exists ${testTableName}_xxxx`)
    expect(p).toBeUndefined()
  })

  test('findOneByQuery no data', async () => {
    const r = await mk.findOneByQuery(
      `select * from ${testTableName} where type=:type`,
      { type: 'xxx' }
    )
    expect(r).toBeUndefined()
  })

  test('findOneByQuery not array', async () => {
    const r = await mk.findOneByQuery(`drop table if exists ${testTableName}_xxxx`)
    expect(r).toBeUndefined()
  })

  test('has', async () => {
    const r = await mk.has(testTableName, { type: 'horse' })
    expect(r).toBe(false)
  })

  test('update', async () => {
    const r = await mk.update<Animal>(testTableName, { age: 99 }, { type: 'cat' })
    const rows = await mk.find(testTableName)
    let count = 0
    for (const row of rows) {
      if (row.type === 'cat') {
        count += 1
        expect(row.age).toBe(99)
      } else {
        expect(row.age).not.toBe(99)
      }
    }
    expect(r.affectedRows).toBe(count)
  })

  test('update with empty conditions', async () => {
    expect.assertions(1)
    try {
      await mk.update<Animal>(testTableName, { age: 98 }, {})
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  test('updateAndFind', async () => {
    const r = await mk.updateAndFind<Animal>(testTableName, { age: 90 }, { id: 1 })
    expect(r.age).toBe(90)
  })

  test('updateAndFind with empty conditions', async () => {
    expect.assertions(1)
    try {
      await mk.updateAndFind<Animal>(testTableName, { age: 98 }, {})
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  test('pickValues', () => {
    const source: Animal = {
      type: 'cat',
      name: 'Tom',
      age: 2,
      status: 1
    }
    const picked = pickValues(source, ['type', 'age'])
    expect(Object.keys(picked).length).toBe(2)
    expect(isValuesEqual(source, picked, ['type', 'age'])).toBe(true)
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