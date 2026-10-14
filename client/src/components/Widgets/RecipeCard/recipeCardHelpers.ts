import type { IconName } from '@fortawesome/fontawesome-svg-core'
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

/** Ingredient id -> card illustration; the first mapped ingredient of a recipe wins. */
/** A Font Awesome icon, or our own steak (FA's free set has no beef cut, and its cow has an udder). */
export type Hero = IconName | 'steak'

export const HERO_ICONS: Readonly<Record<string, Hero>> = {
  'chicken-thigh': 'drumstick-bite',
  'beef-mince': 'steak',
  'beef-rump': 'steak',
  'pork-mince': 'bacon',
  'pork-belly': 'bacon',
  'cooked-prawns': 'shrimp',
  egg: 'egg',
  spaghetti: 'bowl-food',
  haloumi: 'cheese',
  'red-lentils': 'bowl-rice',
  'jasmine-rice': 'bowl-rice',
  potato: 'carrot',
  cauliflower: 'carrot'
}
export const DEFAULT_HERO_ICON: Hero = 'utensils'

export const heroIcon = (ingredientIds: readonly string[]): Hero =>
  ingredientIds.flatMap((id) => {
    const icon = HERO_ICONS[id]
    return icon === undefined ? [] : [icon]
  })[0] ?? DEFAULT_HERO_ICON
