import mysql from 'mysql'
import { replaceBatch } from './tools'
import { emit } from './event'

export default (pool: mysql.Pool) => (query: string, values: any) => {
  let real = query
    .replace(/^\s+/, '')
    .replace(/^\s$/, '')
    .replace(/\n+/g, ' ')

  const replaces: Parameters<typeof replaceBatch>[1] = []

  if (Array.isArray(values)) {
    for (const v of values) {
      replaces.push([/\?/, pool.escape(v)])
    }
  } else if (values) {
    const keys = Object.keys(values).sort((a, b) => b.length - a.length)
    for (const key of keys) {
      replaces.push([new RegExp(`:${key}`, 'g'), pool.escape(values[key])])
    }
  }
  real = replaceBatch(real, replaces)
  emit('query', real)

  return real
}
