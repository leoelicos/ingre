import { sectionColours } from '../../utils/library/recipeLibrary'
import type { Aisle, ShopSection } from '../../utils/shopping/sections'
import { AISLES, placeInShop } from '../../utils/shopping/sections'
import type { BadgeTone } from './tones'
import { FALLBACK_TONE } from './tones'

/**
 * Tailwind classes per tone, written out in full so Tailwind can see them.
 * Background, matching ink text and a 1px ink ring so the circle reads on any surface.
 */
export const TONE_CLASSES: Readonly<Record<BadgeTone, string>> = {
  produce: 'bg-badge-produce text-badge-produce-ink border-badge-produce-ink',
  meat: 'bg-badge-meat text-badge-meat-ink border-badge-meat-ink',
  dairy: 'bg-badge-dairy text-badge-dairy-ink border-badge-dairy-ink',
  deli: 'bg-badge-deli text-badge-deli-ink border-badge-deli-ink',
  bakery: 'bg-badge-bakery text-badge-bakery-ink border-badge-bakery-ink',
  pantry: 'bg-badge-pantry text-badge-pantry-ink border-badge-pantry-ink',
  frozen: 'bg-badge-frozen text-badge-frozen-ink border-badge-frozen-ink',
  neutral: 'bg-badge-neutral text-badge-neutral-ink border-badge-neutral-ink'
}

const isAisle = (value: string): value is Aisle =>
  AISLES.some((aisle) => aisle === value)

/** Tone for a shop section, from the map in data/ingredients.json. */
export const sectionTone = (section: ShopSection): BadgeTone =>
  sectionColours[section]

/** Tone for an ingredient's catalogue category (its aisle); anything else is neutral. */
export const categoryTone = (category: string): BadgeTone =>
  isAisle(category) ? sectionTone(placeInShop(category).section) : FALLBACK_TONE
