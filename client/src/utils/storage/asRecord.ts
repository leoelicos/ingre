/** A plain object (not an array, not null) as a record of unknowns; null for anything else. */
export const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? { ...value }
    : null
