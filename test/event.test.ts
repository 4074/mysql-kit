import mk, { MysqlKitEventData } from '../src'
import config from './config'

beforeAll(() => {
  mk.connect(config)
})

describe('Event', () => {
  test('on & off', async () => {
    let queryLog: MysqlKitEventData
    let queryEndLog: MysqlKitEventData

    const handleQuery = (l) => { queryLog = l }
    const handleQueryEnd = (l) => { queryEndLog = l }

    mk.on('query', handleQuery)
    mk.on('queryEnd', handleQueryEnd)

    await mk.query('show tables')

    expect(queryLog.host).toBe(config.host)
    expect(queryLog.database).toBe(config.database)
    expect(queryLog.type).toBe('query')
    expect(queryLog.sql).toBe('show tables')

    expect(queryEndLog.type).toBe('queryEnd')
    expect(queryEndLog.duration).toBeGreaterThan(0)
    expect(Object.keys(queryEndLog).includes('error')).toBe(false)

    queryLog = null
    queryEndLog = null

    mk.off('query', handleQuery)
    await mk.query('show tables')

    expect(queryLog).toBeNull()
    expect(queryEndLog).not.toBeNull()
  })

  test('once', async () => {
    let queryLog: MysqlKitEventData

    const handleQuery = (l) => { queryLog = l }
    mk.once('query', handleQuery)
    await mk.query('show tables')
    expect(queryLog.host).toBe(config.host)

    queryLog = null
    await mk.query('show tables')
    expect(queryLog).toBeNull()
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