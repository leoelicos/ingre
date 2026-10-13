/** Splits "Shaking beef (bò lúc lắc)" into its title and trailing bracketed local name. */
export const splitTitle = (
  name: string
): { title: string; localName: string | null } => {
  const match = /^(.*\S)\s*\(([^()]+)\)\s*$/.exec(name)
  const title = match?.[1]
  const localName = match?.[2]
  return title === undefined || localName === undefined
    ? { title: name.trim(), localName: null }
    : { title, localName: localName.trim() }
}

/** Stable React key: server id, then library id, then name. */
export const recipeKey = ({
  _id,
  libraryId,
  name
}: {
  _id?: string
  libraryId?: string
  name: string
}): string => _id ?? libraryId ?? name

export type Tint = 'dinner' | 'lunch'

const LUNCH_TAGS = ['lunch', 'sweet']

/** Card header tint: lunch/sweet recipes are coral, everything else herb. */
export const tintFor = (tags: readonly string[]): Tint =>
  tags.some((tag) => LUNCH_TAGS.includes(tag.toLowerCase()))
    ? 'lunch'
    : 'dinner'
