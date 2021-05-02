import { replaceBatch } from '../src/tools'

describe('tools', () => {
  test('replaceBatch', () => {
    const r = replaceBatch('select * from table where a=? and b=?', [['?', '??'], [/\?/, 'bbb']])
    expect(r).toBe('select * from table where a=?? and b=bbb')
  })
})