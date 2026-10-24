import type { FC } from 'react'
import type { BadgeCodeSource } from './badgeCode'
import { resolveBadgeCode } from './badgeCode'
import { TONE_CLASSES, categoryTone } from './badgeTone'
import type { BadgeTone } from './tones'

const SHAPE =
  'inline-flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-pill border text-sm font-bold leading-none tracking-wide'

/** Name (and catalogue badgeCode, when set) for the code; category for the colour. */
export type IngredientBadgeProps = BadgeCodeSource & {
  readonly category: string
  /** overrides the category's colour, e.g. after a chip's category is edited (#179) */
  readonly tone?: BadgeTone
}

/**
 * An ingredient drawn in code: a circle with a three-letter code, coloured by its shop section.
 * The code is the catalogue's `badgeCode` when given, otherwise derived from the name.
 * Decorative: hidden from screen readers, because the full name is always shown as text beside
 * it (see KeyIngredients), so nothing is announced twice. Not interactive.
 */
export const IngredientBadge: FC<IngredientBadgeProps> = (props) => (
  <span
    aria-hidden="true"
    className={`${SHAPE} ${
      TONE_CLASSES[props.tone ?? categoryTone(props.category)]
    }`}
  >
    {resolveBadgeCode(props)}
  </span>
)
