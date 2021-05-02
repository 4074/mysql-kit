import { getPool } from './connect'

export const names = {
  query: '__MYSQL_KIT_BEFORE_QUERY_EVENT__',
  queryEnd: '__MYSQL_KIT_QUERY_END_EVENT__',
}

export interface MysqlKitEventData {
  type: keyof typeof names
  host: string
  database: string
  sql: string
  date: Date
  duration?: number
  error?: Error
}

// eslint-disable-next-line max-params
export const emit = (type: MysqlKitEventData['type'], sql: string, startDate?: Date, error?: Error) => {
  const pool = getPool()
  const eventData: MysqlKitEventData = {
    type,
    host: pool.config.connectionConfig.host,
    database: pool.config.connectionConfig.database,
    sql: sql,
    date: new Date()
  }
  if (startDate) eventData.duration = eventData.date.getTime() - startDate.getTime()
  if (error) eventData.error = error
  pool.emit(names[type], eventData)
}

export const on = (type: MysqlKitEventData['type'], handle: (data: MysqlKitEventData) => void) => {
  const pool = getPool()
  if (!pool) return
  pool.on(names[type], handle)
  return pool.off.bind(names[type], handle)
}

export const once = (type: MysqlKitEventData['type'], handle: (data: MysqlKitEventData) => void) => {
  const pool = getPool()
  if (!pool) return
  pool.once(names[type], handle)
}

export const off = (type: MysqlKitEventData['type'], handle: (...args: any[]) => void) => getPool().off(names[type], handle)