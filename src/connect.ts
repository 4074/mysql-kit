import mysql from 'mysql'

export interface QueryEventData {
  host: string
  database: string
  sql: string
  stage: 'in' | 'out'
  date: Date
}

let pool: mysql.Pool

export const getPool = (): mysql.Pool | undefined => pool

export default function connect(...params: Parameters<typeof mysql.createPool>): mysql.Pool {
  pool = mysql.createPool(...params)
  setup(pool)
  return pool
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