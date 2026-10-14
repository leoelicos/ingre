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
export const tagLabel = (tag: string): string =>
  tag.charAt(0).toUpperCase() + tag.slice(1)
