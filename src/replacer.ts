export default class Replacer {
  private repalcements: [string, any][] = []
  private source = ''

  public constructor(source: string) {
    this.source = source
  }

  public add(search: string | RegExp, replace: any) {
    const random = Math.random().toString()
    this.source = this.source.replace(search, random)
    this.repalcements.push([random, replace])
  }

  public produce() {
    let result = this.source
    for (const [random, replace] of this.repalcements) {
      result = result.replace(new RegExp(random, 'g'), replace)
    }
    return result
  }
}