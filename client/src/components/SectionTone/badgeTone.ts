import { sectionColours } from '../../utils/library/recipeLibrary'
import type { ShopSection } from '../../utils/shopping/sections'
import type { BadgeTone } from './tones'

/**
 * Tailwind classes per tone, written out in full so Tailwind can see them.
 * Background, matching ink text and a 1px ink ring so the pill reads on any surface.
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

/**
 * Chip edges per tone: ink text and a 1px ink outline, no fill, so the chip sits on the page
 * as a raised platform. Ink on the page background is at least 4.5:1 (badgeContrast test).
 */
export const EDGE_TONE_CLASSES: Readonly<Record<BadgeTone, string>> = {
  produce: 'text-badge-produce-ink border-badge-produce-ink',
  meat: 'text-badge-meat-ink border-badge-meat-ink',
  dairy: 'text-badge-dairy-ink border-badge-dairy-ink',
  deli: 'text-badge-deli-ink border-badge-deli-ink',
  bakery: 'text-badge-bakery-ink border-badge-bakery-ink',
  pantry: 'text-badge-pantry-ink border-badge-pantry-ink',
  frozen: 'text-badge-frozen-ink border-badge-frozen-ink',
  neutral: 'text-badge-neutral-ink border-badge-neutral-ink'
}

/** Tone for a shop section, from the map in data/ingredients.json. */
export const sectionTone = (section: ShopSection): BadgeTone =>
  sectionColours[section]
