/** Shown when a name has no letters or digits to make a code from. */
export const EMPTY_CODE = '?'

/** Upper-case words of letters and digits, accents dropped ("Crème fraîche" -> CREME, FRAICHE). */
export const codeWords = (name: string): string[] =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter((word) => word !== '')

/** First letter of the first word plus the first two of the last. */
const initialism = (words: readonly string[]): string =>
  words.slice(0, 1).join('').slice(0, 1) + words.slice(-1).join('').slice(0, 2)

/**
 * Three-letter badge code. One word: its first three letters ("Tomato" -> "TOM").
 * Several words: initialism, so "beef mince" -> "BMI" and "beef rump steak" -> "BST" differ.
 * A name with nothing to show gets EMPTY_CODE; the code is never empty.
 */
export const badgeCode = (name: string): string => {
  const words = codeWords(name)
  const code = words.length > 1 ? initialism(words) : words.join('').slice(0, 3)
  return code === '' ? EMPTY_CODE : code
}

/** What a badge needs to pick its code: the name, and the catalogue override when there is one. */
export type BadgeCodeSource = {
  readonly name: string
  readonly badgeCode?: string
}

/** The catalogue's badgeCode when set, otherwise the code derived from the name. */
export const resolveBadgeCode = (item: BadgeCodeSource): string =>
  item.badgeCode ?? badgeCode(item.name)

type CodeGroups = ReadonlyMap<string, readonly string[]>

/** A copy of the groups with this item's name added under its resolved code. */
const addToGroup = (groups: CodeGroups, item: BadgeCodeSource): CodeGroups => {
  const code = resolveBadgeCode(item)
  return new Map(groups).set(code, [...(groups.get(code) ?? []), item.name])
}

/** Item names grouped by their resolved code, in catalogue order. */
export const namesByCode = (items: readonly BadgeCodeSource[]): CodeGroups =>
  items.reduce(addToGroup, new Map<string, readonly string[]>())

/** Every code shared by two or more items, as "CODE: name, name"; empty when all codes are unique. */
export const duplicateBadgeCodes = (
  items: readonly BadgeCodeSource[]
): string[] =>
  [...namesByCode(items)]
    .filter(([, names]) => names.length > 1)
    .map(([code, names]) => `${code}: ${names.join(', ')}`)
