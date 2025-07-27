type ColumnType = {
  name: string
  type: 'number' | 'string' | 'other'
}

export function inferColumnTypes(data: Record<string, unknown>[]): ColumnType[] {
  if (data.length === 0) return []

  const sample = data[0]
  return Object.keys(sample).map((key) => {
    const value = sample[key]
    const type = typeof value
    if (type === 'number') return { name: key, type: 'number' }
    if (type === 'string') return { name: key, type: 'string' }
    return { name: key, type: 'other' }
  })
}
