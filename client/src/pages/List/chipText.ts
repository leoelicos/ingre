import type { Chip } from '../../utils/chips/chips'
import { categoryLabel, recipeCountText } from '../../utils/chips/chips'
import { buyAmount, displayName } from '../../utils/shopping/shoppingList'

/** Ids for a chip's parts, so focus can move between them without refs. */
export const chipToggleId = (id: string): string => `chip-${id}`
export const chipChevronId = (id: string): string => `chip-${id}-more`
export const chipPanelId = (id: string): string => `chip-${id}-panel`
export const chipCategoryId = (id: string): string => `chip-${id}-category`

/**
 * What VoiceOver reads for a chip (#179): name, quantity, category, how many recipes, and
 * crossed off when it is. The pressed state is announced as well.
 */
export const chipLabel = (chip: Chip): string =>
  [
    displayName(chip.line),
    buyAmount(chip.line),
    categoryLabel(chip.section),
    recipeCountText(chip),
    ...(chip.crossed ? ['crossed off'] : [])
  ].join(', ')

/** The recipes a chip is used in, or that it was added by hand. */
export const usedInText = (chip: Chip): readonly string[] =>
  chip.line.recipes.length === 0 ? ['Added by you'] : chip.line.recipes
