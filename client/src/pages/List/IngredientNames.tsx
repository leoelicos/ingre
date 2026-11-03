import { useT } from '../../i18n'
import type { FC } from 'react'
import type { CopyLine } from '../../utils/balance/copies'
import { startSection } from '../../utils/chips/chips'
import { useGuestList } from '../../utils/guests/GuestsContext'
import { flaggedIngredientIds } from '../../utils/guests/guests'
import { displayName } from '../../utils/shopping/shoppingList'
import { edgeToneOf } from './Chips'

/** A read-only chip's look: the chip's section edge, flat (no shadow), just the name. */
export const nameChipClass = (line: CopyLine): string =>
  `rounded-pill border px-3 py-1 text-sm font-semibold leading-tight ${edgeToneOf(
    startSection(line.item)
  )}`

/** A guest's allergen (#209): an outline in the accent colour; the row's words say who and what. */
export const GUEST_OUTLINE = 'outline outline-2 outline-offset-1 outline-accent'

/**
 * A closed recipe row's ingredients: every one by name, as flat read-only chips (#191).
 * A plain list, not controls: no checkbox, amount or chevron, and nothing to focus.
 */
export const IngredientNames: FC<{
  lines: readonly CopyLine[]
  title: string
}> = ({ lines, title }) => {
  const t = useT()
  const flagged = flaggedIngredientIds(lines, useGuestList())
  return (
    <ul
      aria-label={t('row.ingredientsIn', { title })}
      data-testid="ingredient-names"
      className="col-span-2 m-0 flex list-none flex-wrap gap-2 pb-4 pl-14 pr-4 pt-0"
    >
      {lines.map((line) => (
        <li
          key={line.ingredientId}
          data-name-chip={line.ingredientId}
          data-guest-flag={flagged.has(line.ingredientId) ? 'true' : undefined}
          className={[
            nameChipClass(line),
            ...(flagged.has(line.ingredientId) ? [GUEST_OUTLINE] : [])
          ].join(' ')}
        >
          {displayName(line)}
        </li>
      ))}
    </ul>
  )
}
