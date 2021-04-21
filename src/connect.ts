import mysql from 'mysql'

export interface QueryEventData {
  host: string
  database: string
  sql: string
  stage: 'in' | 'out'
  date: Date
}

export let pool: mysql.Pool

export default async function connect(...params: Parameters<typeof mysql.createPool>): Promise<mysql.Pool> {
  return new Promise((resolve, reject) => {
    try {
      pool = mysql.createPool(...params)
      pool.once('connection', () => {
        resolve(pool)
      })
      setup(pool)
    } catch (error) {
      reject(error)
    }
  })
}

function setup(pool: mysql.Pool) {
  pool.on('connection', (connection: mysql.PoolConnection) => {
    connection.config.timezone = 'Z'
    connection.config.queryFormat = (query: string, values: any) => {
      let real = query
        .replace(/^\s+/, '')
        .replace(/^\s$/, '')
        .replace(/\n+/g, ' ')

      if (Array.isArray(values)) {
        for (const v of values) {
          real = real.replace(/\?/, pool.escape(v))
        }
      } else if (values) {
        real = real.replace(/:(\w+)/g, (
          txt: string,
          key: string
        ): string => values.hasOwnProperty(key) ? connection.escape(values[key]) : txt)
      }

      const eventData: QueryEventData = {
        host: connection.config.host,
        database: connection.config.database,
        sql: real.replace(/\s+/g, ' '),
        stage: 'in',
        date: new Date()
      }
      pool.emit('mk-query', {
        target: 'mysql-kit',
        data: eventData
      })

      return real
    }
  })
}