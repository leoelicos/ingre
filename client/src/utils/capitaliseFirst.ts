/** Upper-cases the first character, for an item or recipe name that starts a sentence. */
export const capitaliseFirst = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)
