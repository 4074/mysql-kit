import connect, { getPool } from './connect'
import {
  query,
  find,
  findOne,
  findOneById,
  findOneByQuery,
  has,
  insert,
  insertAndFind,
  update,
  updateAndFind
} from './query'
import { pickValues } from './tools'

import { on, once, off } from './event'
export type { MysqlKitEventData, names as eventNames } from './event'


export default {
  connect,
  getPool,
  on,
  once,
  off,

  query,
  find,
  findOne,
  findOneById,
  findOneByQuery,
  has,
  insert,
  insertAndFind,
  update,
  updateAndFind,

  pickValues
}