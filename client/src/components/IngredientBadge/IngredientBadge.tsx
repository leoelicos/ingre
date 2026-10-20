import type { FC } from 'react'
import { badgeCode } from './badgeCode'
import { TONE_CLASSES, categoryTone } from './badgeTone'

const SHAPE =
  'inline-flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-pill border text-sm font-bold leading-none tracking-wide'

/**
 * An ingredient drawn in code: a circle with a three-letter code, coloured by its shop section.
 * Not interactive. Screen readers get one image named with the full ingredient name.
 */
export const IngredientBadge: FC<{ name: string; category: string }> = ({
  name,
  category
}) => (
  <span
    role="img"
    aria-label={name}
    className={`${SHAPE} ${TONE_CLASSES[categoryTone(category)]}`}
  >
    <span aria-hidden="true">{badgeCode(name)}</span>
  </span>
)
