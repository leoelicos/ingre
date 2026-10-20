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
