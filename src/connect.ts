import mysql from 'mysql'
import format from './format'

let pool: mysql.Pool

export const getPool = (): mysql.Pool | undefined => pool

export default function connect(...params: Parameters<typeof mysql.createPool>): mysql.Pool {
  pool = mysql.createPool(...params)
  pool.on('connection', (connection: mysql.PoolConnection) => {
    connection.config.timezone = 'Z'
    connection.config.queryFormat = format(pool)
    // connection.on()
  })

  return pool
}
