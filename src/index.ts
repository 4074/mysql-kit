import connect from './connect'
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

export type { QueryEventData } from './connect'

export default {
  connect,

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