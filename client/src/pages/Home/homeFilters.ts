/** Adds the tag when absent, removes it when present. */
export const toggleTag = (selected: readonly string[], tag: string): string[] =>
  selected.includes(tag)
    ? selected.filter((t) => t !== tag)
    : [...selected, tag]
