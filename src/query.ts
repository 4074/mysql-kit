import mysql from 'mysql'
import { getPool } from './connect'
import { createConditionStr } from './tools'
import { emit } from './event'

// Can not just set ...params: Parameters<typeof pool.query>.
// Because `pool.query` is a overloading function.
// https://github.com/microsoft/TypeScript/issues/26591
// https://www.typescriptlang.org/docs/handbook/type-compatibility.html#optional-parameters-and-rest-parameters
// When a function has overloads, each overload in the source type must be matched by a compatible signature on the target type.
// This ensures that the target function can be called in all the same situations as the source function.
export function query<T = any>(...params: [string | mysql.Query | mysql.QueryOptions, any?] | Parameters<mysql.Pool['query']>): Promise<T> {
  return new Promise((resolve, reject) => {
    const pool = getPool()
    if (!pool) {
      reject(Error('No connection!'))
      return
    }

    const startDate = new Date()
    let result: mysql.Query
    const callback = (error: Error, results: any) => {
      emit('queryEnd', result.sql, startDate, error)
      return error ? reject(error) : resolve(results)
    }

    if (typeof params[params.length - 1] === 'function') {
      const originalCallback = params.pop()
      params.push((error: Error, results: any) => {
        originalCallback(error, results)
        callback(error, results)
      })
    } else {
      params.push(callback)
    }

    result = pool.query(...(params as Parameters<typeof pool.query>))
  })
}

export async function find<T = any>(
  table: string,
  conditions: Partial<T> = {},
  options?: { limit?: number | string }
): Promise<T[]> {
  const where = createConditionStr(conditions)
  let sql = `select * from ${table} ${where}`
  if (options?.limit !== undefined) {
    sql += ` limit ${options.limit}`
  }
  return query<T[]>(sql, conditions)
}

export async function findOne<T extends Record<string, any>>(
  table: string,
  conditions?: Partial<T>
): Promise<T> {
  return (await find(table, conditions, { limit: 1 }))[0]
}

export async function findOneById<T extends { id?: number | string }>(table: string, id: number | string): Promise<T> {
  return findOne<T>(table, { id } as any)
}

export async function findOneByQuery<T extends Record<string, any>>(...args: Parameters<typeof query>): Promise<T> {
  return (await query<T[]>(...args))?.[0]
}

export async function has(...args: Parameters<typeof findOne>): Promise<boolean> {
  return !!(await findOne<any>(...args))
}

export async function insert<T extends Record<string, any>>(
  table: string,
  source: T | T[]
): Promise<mysql.OkPacket> {
  const rows = Array.isArray(source) ? source : [source]
  const keys = Object.keys(rows[0])
  let values = []
  const keysStr = keys.map(k => `\`${k}\``).join(', ')
  const placeholders = Array(rows.length).fill(
    `(${Array(keys.length).fill('?').join(', ')})`
  )

  for (const row of rows) {
    values = values.concat(keys.map(key => row[key]))
  }

  return query(
    `insert into ${table} (${keysStr}) values ${placeholders.join(', ')}`,
    values
  )
}

export async function insertAndFind<T extends { id?: number | string }>(
  table: string,
  values: Partial<T>
): Promise<T> {
  let keys = Object.keys(values)
  if (values.id && values.id < 0) {
    keys = keys.filter((k) => k !== 'id')
  }
  const sql = `insert into ${table} (${keys.map(k => `\`${k}\``).join(', ')}) values (${keys.map((k) => `:${k}`).join(', ')})`
  const result = await query<any>(sql, values)
  if (result?.insertId) return findOneById(table, result.insertId)
}

export async function update<T extends Record<string, any>>(
  table: string,
  updates: Partial<T>,
  conditions: Partial<T>
): Promise<mysql.OkPacket> {
  const where = createConditionStr(conditions)
  if (!where) {
    throw Error('Update with empty conditions is a danger operation. Please check your code, and make this operation using `query` method.')
  }
  const keys = Object.keys(updates)
  const values = keys.map((key) => `\`${key}\` = :${key}`)
  return query(`update ${table} set ${values.join(', ')} ${where}`, { ...updates, ...conditions })
}

export async function updateAndFind<T extends Record<string, any>>(
  table: string,
  updates: Partial<T>,
  conditions: Partial<T>
): Promise<T> {
  await update(table, updates, conditions)
  return findOne(table, conditions)
}