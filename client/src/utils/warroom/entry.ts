/*
 * Rapid entry in the War room (t26u): the thing being typed now is the last part of the line,
 * so suggestions follow it, Tab completes it, and a pasted list goes in line by line.
 */
import type { LibraryIngredient } from '../../types/library'
import { leadingQuantity, SEPARATORS } from './capture'

export interface LineParts {
  /** everything up to and including the last separator: "2 carrots, " */
  readonly head: string
  /** the part being typed now: "oni" */
  readonly tail: string
}

const LAST_SEPARATOR = new RegExp(`^([^]*(?:${SEPARATORS.source}))`, 'i')

/** "2 carrots, oni" is "2 carrots," and " oni". */
export const lineParts = (text: string): LineParts => {
  const head = LAST_SEPARATOR.exec(text)?.[1] ?? ''
  return { head, tail: text.slice(head.length) }
}

/** The line with its last part completed to the item's name, keeping its quantity: "2 carrots, brown onion". */
export const completed = (text: string, item: LibraryIngredient): string => {
  const { head, tail } = lineParts(text)
  const trimmed = tail.trimStart()
  const quantity = leadingQuantity(trimmed.trimEnd())?.[0] ?? ''
  const gap = head === '' || /\s$/.test(head) ? '' : ' '
  return `${head}${gap}${quantity}${item.name}`
}

/** Bullets, checkboxes and numbering a list copied from notes or a chat starts its lines with. */
const LIST_MARK = /^\s*(?:[-*•·▪◦–]|\[[ xX]?\]|[☐☑✓✔]|\d+[.)])\s*/

/** True when pasted text is a list (more than one line), not a word. */
export const isList = (pasted: string): boolean => /\n/.test(pasted.trim())

/** One item per line, marks and blank lines gone: "- milk\n- [ ] 2 eggs" -> "milk\n2 eggs". */
export const listLines = (pasted: string): string =>
  pasted
    .split(/\r?\n/)
    .map((line) => line.replace(LIST_MARK, '').trim())
    .filter((line) => line !== '')
    .join('\n')
