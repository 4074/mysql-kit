import Replacer from '../src/replacer'

describe('Replacer', () => {
  test('replace whith char', () => {
    const replacer = new Replacer('aaaaaa :b :c d:bd :c dd')
    replacer.add(/:c/g, 'cat')
    replacer.add(/:b/, 'bob!')
    expect(replacer.produce()).toBe('aaaaaa bob! cat d:bd cat dd')
  })

  test('replace whith ?', () => {
    const replacer = new Replacer('aaaaaa ? ? dd ? dd')
    replacer.add('?', '?first???')
    replacer.add(/\?/, 'second')
    expect(replacer.produce()).toBe('aaaaaa ?first??? second dd ? dd')
  })
})