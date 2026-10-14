export const returnPath = (state: unknown): string => {
  if (typeof state !== 'object' || state === null) return '/'
  if (!('from' in state)) return '/'
  const from = state.from
  if (typeof from !== 'string' || from.length === 0) return '/'
  return from
}
