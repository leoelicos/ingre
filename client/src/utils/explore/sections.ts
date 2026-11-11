/* Supermarket sections in Explore (#226): the shop sections, with fruit and seafood split out. */
import type { BadgeTone } from '../../components/SectionTone/tones'
import type { LibraryIngredient } from '../../types/library'
import { classOf, groupOf } from '../profile/classes'
import type { ShopSection } from '../shopping/sections'
import { placeInShop } from '../shopping/sections'

export type ExploreSection =
  | 'vegetables'
  | 'fruit'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'deli'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'other'

/** The order the section filter lists them in. */
export const EXPLORE_SECTIONS: readonly ExploreSection[] = [
  'vegetables',
  'fruit',
  'meat',
  'seafood',
  'dairy',
  'deli',
  'bakery',
  'pantry',
  'frozen',
  'other'
]

/** Green = vegetables, orange = fruit, pink = meat, blue = seafood; the rest as the shop's own. */
export const SECTION_TONE: Readonly<Record<ExploreSection, BadgeTone>> = {
  vegetables: 'produce',
  fruit: 'fruit',
  meat: 'meat',
  seafood: 'seafood',
  dairy: 'dairy',
  deli: 'deli',
  bakery: 'bakery',
  pantry: 'pantry',
  frozen: 'frozen',
  other: 'neutral'
}

/** Left accent bar per section, written out in full so Tailwind can see it. */
export const SECTION_ACCENT: Readonly<Record<ExploreSection, string>> = {
  vegetables: 'border-badge-produce-ink',
  fruit: 'border-badge-fruit-ink',
  meat: 'border-badge-meat-ink',
  seafood: 'border-badge-seafood-ink',
  dairy: 'border-badge-dairy-ink',
  deli: 'border-badge-deli-ink',
  bakery: 'border-badge-bakery-ink',
  pantry: 'border-badge-pantry-ink',
  frozen: 'border-badge-frozen-ink',
  other: 'border-badge-neutral-ink'
}

const FROM_SHOP: Readonly<Record<ShopSection, ExploreSection>> = {
  'Fruit & Veg': 'vegetables',
  'Meat & Seafood': 'meat',
  'Dairy, Eggs & Fridge': 'dairy',
  Deli: 'deli',
  Bakery: 'bakery',
  Pantry: 'pantry',
  Frozen: 'frozen',
  Other: 'other'
}

/** An ingredient's section: its shop section, with fruit split from veg and seafood from meat. */
export const exploreSectionOf = (item: LibraryIngredient): ExploreSection => {
  const shop = placeInShop(item.category).section
  if (shop === 'Fruit & Veg' && groupOf(classOf(item.id)) === 'fruit')
    return 'fruit'
  if (shop === 'Meat & Seafood' && item.category === 'seafood') return 'seafood'
  return FROM_SHOP[shop]
}

/** The sections these items fall in, in the filter's order. */
export const sectionsOf = (
  items: readonly LibraryIngredient[]
): ExploreSection[] => {
  const present = new Set(items.map(exploreSectionOf))
  return EXPLORE_SECTIONS.filter((section) => present.has(section))
}

/** The items in the chosen sections; none chosen (or none present) means all. */
export const inSections = (
  items: readonly LibraryIngredient[],
  chosen: ReadonlySet<ExploreSection>
): LibraryIngredient[] => {
  const active = sectionsOf(items).filter((section) => chosen.has(section))
  return active.length === 0
    ? [...items]
    : items.filter((item) => active.includes(exploreSectionOf(item)))
}
