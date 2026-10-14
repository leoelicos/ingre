import { capitaliseFirst } from '../../utils/capitaliseFirst'
/** Adds the tag when absent, removes it when present. */
export const toggleTag = (selected: readonly string[], tag: string): string[] =>
  selected.includes(tag)
    ? selected.filter((t) => t !== tag)
    : [...selected, tag]

/** Meal and diet tags lead, in this order; cuisines follow alphabetically. */
export const MEAL_DIET_TAGS: readonly string[] = [
  'breakfast',
  'lunch',
  'dinner',
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free'
]

const rank = (tag: string) => {
  const i = MEAL_DIET_TAGS.indexOf(tag.toLowerCase())
  return i === -1 ? MEAL_DIET_TAGS.length : i
}

export const orderTags = (tags: readonly string[]): string[] =>
  [...tags].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))

/** "gluten-free" -> "Gluten-free". */
export const tagLabel = (tag: string): string => capitaliseFirst(tag)

/** The one row of chips shown on narrow screens before "More". */
export const PRIMARY_TAGS: readonly string[] = [
  'lunch',
  'dinner',
  'vegetarian',
  'vegan',
  'gluten-free'
]

/** Collapsed: primary tags plus any active filter (never hidden). Expanded: all. */
export const visibleTags = (
  tags: readonly string[],
  selected: readonly string[],
  collapsed: boolean
): string[] =>
  collapsed
    ? tags.filter(
        (t) => PRIMARY_TAGS.includes(t.toLowerCase()) || selected.includes(t)
      )
    : [...tags]
