/* How Ingredients and Recipes share the width (#181). Pure, so the rules are easy to test. */
import { translate } from '../../i18n'

export type Split = 'vertical' | '50/50' | '25/75' | '75/25'

export const SPLITS: readonly Split[] = ['vertical', '50/50', '25/75', '75/25']

export const SPLIT_KEY = 'ingre.layout.split'

export const DEFAULT_SPLIT: Split = '50/50'

export const parseSplit = (value: unknown): Split | null =>
  SPLITS.find((split) => split === value) ?? null

/** What the layout toggle offers: nothing below 576px, two choices to 992px, all four above. */
export const splitOptions = (
  splitWidth: boolean,
  wideWidth: boolean
): readonly Split[] =>
  !splitWidth ? [] : wideWidth ? SPLITS : SPLITS.slice(0, 2)

/** The split in use: vertical when narrow; a 25/75 or 75/25 preference falls back to 50/50. */
export const effectiveSplit = (
  preferred: Split,
  splitWidth: boolean,
  wideWidth: boolean
): Split =>
  !splitWidth
    ? 'vertical'
    : splitOptions(splitWidth, wideWidth).includes(preferred)
    ? preferred
    : '50/50'

/** Grid columns per split; minmax(0, …) lets long chips wrap instead of widening a column. */
export const SPLIT_COLUMNS: Readonly<Record<Split, string>> = {
  vertical: 'grid-cols-1',
  '50/50': 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
  '25/75': 'grid-cols-[minmax(0,1fr)_minmax(0,3fr)]',
  '75/25': 'grid-cols-[minmax(0,3fr)_minmax(0,1fr)]'
}

/** What the toggle reads out for each choice. */
export const SPLIT_LABELS: Readonly<Record<Split, string>> = {
  vertical: translate('layout.vertical'),
  '50/50': translate('layout.split', { ingredients: 50, recipes: 50 }),
  '25/75': translate('layout.split', { ingredients: 25, recipes: 75 }),
  '75/25': translate('layout.split', { ingredients: 75, recipes: 25 })
}
