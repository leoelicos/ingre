/* Text for the local retrieval index (#225): lowercase words with a light plural stem. */

/** "tomatoes" and "tomato", "berries" and "berry", "lentils" and "lentil" share one stem. */
export const stem = (word: string): string => {
  if (word.length <= 3) return word
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.endsWith('ss') || word.endsWith('us')) return word
  if (/(o|ch|sh|x)es$/.test(word)) return word.slice(0, -2)
  return word.endsWith('s') ? word.slice(0, -1) : word
}

/** The words of a text, lowercased, accents kept out of the way, each stemmed. */
export const tokenise = (text: string): string[] =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((word) => word !== '')
    .map(stem)
