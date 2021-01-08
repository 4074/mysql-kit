/* eslint-disable max-params */
import mysql from 'mysql'

interface QueryEventData {
  host: string
  database: string
  sql: string
  date: Date
}

export let pool: mysql.Pool

export default (...params: Parameters<typeof mysql.createPool>) => {
  pool = mysql.createPool(...params)
  setup(pool)
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
        ): string => {
          if (values.hasOwnProperty(key)) {
            const escaped = connection.escape(values[key])
            return Array.isArray(values[key]) ? `(${escaped})` : escaped
          }
          return txt
        })
      }

      const eventData: QueryEventData = {
        host: connection.config.host,
        database: connection.config.database,
        sql: real.replace(/\s+/g, ' '),
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

export function query<T>(...params: Parameters<mysql.QueryFunction>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!pool) {
      reject(Error('No connection!'))
      return
    }

    const callback = (error: Error, results: any) => error ? reject(error) : resolve(results)

    if (typeof params[params.length - 1] === 'function') {
      const originalCallback = params.pop()
      params.push((error: Error, results: any) => {
        originalCallback(error, results)
        callback(error, results)
      })
    } else {
      params.push(callback)
    }

    pool.query(...params)
  })
}

export async function find<T>(
  table: string,
  conditions: Record<keyof T, any>
): Promise<T> {
  const wheres = Object.keys(conditions).map((k) => `${k}=:${k}`)
  const sql = `select * from ${table} where ${wheres.join(' and ')}`
  return query<T>(sql, conditions)
}

export async function findOne<T extends Record<string, any>>(
  table: string,
  conditions: Record<keyof T, any>
): Promise<T> {
  const wheres = Object.keys(conditions).map((k) => `${k}=:${k}`)
  const sql = `select * from ${table} where ${wheres.join(' and ')}`
  const result = await query<T[]>(sql, conditions)
  if (result?.length) return result[0]
}

export async function findOneById<T extends { id: number | string }>(table: string, id: number | string): Promise<T> {
  return findOne<T>(table, { id } as any)
}

export async function findOneByQuery<T>(...args: Parameters<typeof query>): Promise<T> {
  const result = await query<T[]>(...args)
  if (result?.length) return result[0]
}

export async function has(...args: Parameters<typeof findOne>): Promise<boolean> {
  const result = await findOne<any>(...args)
  return result?.length > 0
}

export async function insert(
  table: string,
  source: Record<string, any> | Record<string, any>[]
): Promise<void> {
  const values = Array.isArray(source) ? source : [source]
  const keys = Object.keys(values[0])
  const vs = values.map((item) => {
    return `(${keys.map((k) => pool.escape(item[k])).join(', ')})`
  })
  const sql = `insert into ${table} (${keys.join(', ')}) values ${vs.join(',')}`
  return query(sql, values)
}

export async function insertAndFind<T extends { id: number | string }>(
  table: string,
  values: Record<string, any>
): Promise<T> {
  let keys = Object.keys(values)
  if (values.id && values.id < 0) {
    keys = keys.filter((k) => k !== 'id')
  }
  const sql = `insert into ${table} (${keys.join(', ')}) values (${keys.map((k) => `:${k}`).join(', ')})`
  const result = await query<any>(sql, values)
  if (result?.insertId) {
    return findOneById(table, result.insertId)
  }
}

export async function update<T extends Record<string, any>>(
  table: string,
  values: T,
  updateKeys: (keyof T)[] = [],
  updateBy = 'id'
): Promise<void> {
  const keys = updateKeys.length
    ? updateKeys
    : Object.keys(values).filter((key) => key !== updateBy)
  const vs = keys.map((key) => `${key} = :${key}`)
  const sql = `update ${table} set ${vs.join(', ')} where ${updateBy} = :${updateBy}`
  return query(sql, values)
}

export async function updateAndFind<T extends Record<string, any> & { id: number | string }>(
  table: string,
  values: T,
  updateKeys: (keyof T)[] = [],
  updateBy = 'id'
): Promise<T> {
  await update(table, values, updateKeys, updateBy)
  return findOneById(table, values.id)
}