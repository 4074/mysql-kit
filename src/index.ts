/* eslint-disable max-params */
import mysql from 'mysql'

export interface QueryEventData {
  host: string
  database: string
  sql: string
  date: Date
}

export let pool: mysql.Pool

export default (...params: Parameters<typeof mysql.createPool>): Promise<mysql.Pool> => {
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

// Can not just set ...params: Parameters<typeof pool.query>.
// Because `pool.query` is a overloading function.
// https://github.com/microsoft/TypeScript/issues/26591
// https://www.typescriptlang.org/docs/handbook/type-compatibility.html#optional-parameters-and-rest-parameters
// When a function has overloads, each overload in the source type must be matched by a compatible signature on the target type.
// This ensures that the target function can be called in all the same situations as the source function.
export function query<T = any>(...params: [string | mysql.Query | mysql.QueryOptions, any?] | Parameters<typeof pool.query>): Promise<T> {
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

    pool.query(...(params as Parameters<typeof pool.query>))
  })
}

export async function find<T>(
  table: string,
  conditions?: Partial<T>
): Promise<T[]> {
  const wheres = Object.keys(conditions).map((k) => `${k}=:${k}`)
  const sql = `select * from ${table} where ${wheres.join(' and ')}`
  return query<T[]>(sql, conditions)
}

export async function findOne<T extends Record<string, any>>(
  table: string,
  conditions?: Partial<T>
): Promise<T> {
  return (await find(table, conditions))[0]
}

export async function findOneById<T extends { id: number | string }>(table: string, id: number | string): Promise<T> {
  return findOne<T>(table, { id } as any)
}

export async function findOneByQuery<T>(...args: Parameters<typeof query>): Promise<T> {
  return (await query<T[]>(...args))?.[0]
}

export async function has(...args: Parameters<typeof findOne>): Promise<boolean> {
  return !!(await findOne<any>(...args))
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
  return query(`insert into ${table} (${keys.join(', ')}) values ${vs.join(',')}`, values)
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
  if (result?.insertId) return findOneById(table, result.insertId)
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
  return query(`update ${table} set ${vs.join(', ')} where ${updateBy} = :${updateBy}`, values)
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