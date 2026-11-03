/* #230: the shopping list as CSV: one row per item, with its amount and shop section. */
import type { Chip } from '../chips/chips'
import { CATEGORY_LABELS } from '../chips/chips'
import { formatAmount } from '../shopping/units'

export const CSV_HEADER = 'Item,Quantity,Section'

/** A CSV field, quoted when it holds a comma, a quote or a line break. Leading = + - @ are defused. */
export const csvField = (value: string): string => {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

const row = (chip: Chip): string =>
  [
    chip.name,
    formatAmount(chip.total, chip.item),
    CATEGORY_LABELS[chip.section]
  ]
    .map(csvField)
    .join(',')

/** Items still wanted (not greyed out), in list order, under a header row. */
export const shoppingListCsv = (chips: readonly Chip[]): string =>
  [CSV_HEADER, ...chips.filter((chip) => !chip.greyed).map(row)].join('\r\n')
