/* How Ingredients, Recipes and Explore share the width (#181). Pure, so the rules are easy to test. */
import { translate } from '../../i18n'

export type Split = 'vertical' | '50/50' | '25/75' | '33/33/33' | '75/25'

/** Every split, in the toggle's order: 33/33/33 sits next to 25/75. */
export const SPLITS: readonly Split[] = [
  'vertical',
  '50/50',
  '25/75',
  '33/33/33',
  '75/25'
]

export const SPLIT_KEY = 'ingre.layout.split'

export const DEFAULT_SPLIT: Split = '50/50'

/** Which width breakpoints the viewport has reached (576px and 1328px). */
export interface Widths {
  readonly split: boolean
  readonly drawer: boolean
}

export const parseSplit = (value: unknown): Split | null =>
  SPLITS.find((split) => split === value) ?? null

const TWO: readonly Split[] = ['vertical', '50/50']

/**
 * What the layout toggle offers (#193): nothing below 576px, vertical and 50/50 to 1328px, and
 * from 1328px all five (25/75, 33/33/33 and 75/25 join with the Explore drawer).
 */
export const splitOptions = (widths: Widths): readonly Split[] =>
  !widths.split ? [] : widths.drawer ? SPLITS : TWO

/**
 * The split in use: vertical when narrow; a preference this width does not offer (25/75,
 * 33/33/33 and 75/25 below 1328px) shows as 50/50 and comes back when wide again. The stored
 * preference is never overwritten by this fallback.
 */
export const effectiveSplit = (preferred: Split, widths: Widths): Split =>
  !widths.split
    ? 'vertical'
    : splitOptions(widths).includes(preferred)
    ? preferred
    : '50/50'

/** Where Explore sits: inline below the search bar, the drawer on the right, or a third column. */
export type ExplorePlacement = 'inline' | 'drawer' | 'column'

/** Inline below 1328px; from there the drawer, or the third column with 33/33/33. */
export const explorePlacement = (
  drawer: boolean,
  split: Split
): ExplorePlacement =>
  !drawer ? 'inline' : split === '33/33/33' ? 'column' : 'drawer'

/** Grid columns per split; minmax(0, …) lets long chips wrap instead of widening a column. */
export const SPLIT_COLUMNS: Readonly<Record<Split, string>> = {
  vertical: 'grid-cols-1',
  '50/50': 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
  '25/75': 'grid-cols-[minmax(0,1fr)_minmax(0,3fr)]',
  '33/33/33': 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]',
  '75/25': 'grid-cols-[minmax(0,3fr)_minmax(0,1fr)]'
}

/** What the toggle reads out for each choice. */
export const SPLIT_LABELS: Readonly<Record<Split, string>> = {
  vertical: translate('layout.vertical'),
  '50/50': translate('layout.split', { ingredients: 50, recipes: 50 }),
  '25/75': translate('layout.split', { ingredients: 25, recipes: 75 }),
  '33/33/33': translate('layout.thirds', {
    ingredients: 33,
    recipes: 33,
    explore: 33
  }),
  '75/25': translate('layout.split', { ingredients: 75, recipes: 25 })
}
