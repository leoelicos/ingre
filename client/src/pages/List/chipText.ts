import type { Chip } from '../../utils/chips/chips'
import { categoryLabel, usedInSummary } from '../../utils/chips/chips'
import { displayName } from '../../utils/shopping/shoppingList'
import { formatAmount } from '../../utils/shopping/units'

/**
 * Where a chip sits (#182): "chip" in Ingredients, "extra" in Extra, "row-<recipe>" in a
 * recipe row. Ids are scoped so the same item can show in all three.
 */
export type ChipScope = string

export const INGREDIENTS_SCOPE: ChipScope = 'chip'
export const EXTRA_SCOPE: ChipScope = 'extra'
export const rowScope = (recipeId: string): ChipScope => `row-${recipeId}`

/** Ids for a chip's parts, so focus can move between them without refs. */
export const chipToggleId = (id: string, scope = INGREDIENTS_SCOPE): string =>
  `${scope}-${id}`
export const chipChevronId = (id: string, scope = INGREDIENTS_SCOPE): string =>
  `${scope}-${id}-more`
export const chipPanelId = (id: string, scope = INGREDIENTS_SCOPE): string =>
  `${scope}-${id}-panel`
export const chipCategoryId = (id: string, scope = INGREDIENTS_SCOPE): string =>
  `${scope}-${id}-category`
/** A number box in a chip's panel: one per source ("extra" or a recipe id). */
export const sourceFieldId = (
  id: string,
  source: string,
  scope = INGREDIENTS_SCOPE
): string => `${scope}-${id}-source-${source}`
/** The Yes button of a chip's remove question. */
export const confirmYesId = (id: string, scope = INGREDIENTS_SCOPE): string =>
  `${scope}-${id}-yes`

/** The chip's amount (#181, #182): its total, "1 kg" rather than packs. */
export const chipAmount = (chip: Pick<Chip, 'total'>): string =>
  formatAmount(chip.total)

/** The Extra amount, in the chip's unit. */
export const extraAmount = (chip: Pick<Chip, 'extra' | 'unit'>): string =>
  formatAmount({ amount: chip.extra ?? 0, unit: chip.unit })

/**
 * What VoiceOver reads for a chip (#179, #182): name, amount, category, where it is used, and
 * crossed off when it is. The pressed state is announced as well.
 */
export const chipLabel = (chip: Chip, amount: string = chipAmount(chip)) =>
  [
    displayName(chip),
    amount,
    categoryLabel(chip.section),
    usedInSummary(chip),
    ...(chip.crossed ? ['crossed off'] : [])
  ].join(', ')
