export const createConditionStr = (conditions: Record<string, any>) => {
  const wheres = Object.keys(conditions).map(
    (k) => Array.isArray(conditions[k]) ? `\`${k}\` in (:${k})` : `\`${k}\`=:${k}`
  )
  if (wheres.length) return ` where ${wheres.join(' and ')}`
  return ''
}

export const pickValues = <T, K extends keyof T>(source: T, keys: K[]) => {
  const result: Partial<T> = {}
  for (const key of keys) {
    result[key] = source[key]
  }
  return result
}