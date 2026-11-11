import { useT } from '../../i18n'
import type { FC } from 'react'
import { IngredientPicture } from '../../components/IngredientPicture'
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

/** Closed-row names. A phone card scrolls them in one row so the card cannot fill the screen. */
export const namesClass = (scroll: boolean): string =>
  `col-span-2 m-0 flex list-none gap-2 pb-4 pl-14 pr-4 pt-0 ${
    scroll ? 'flex-nowrap overflow-x-auto' : 'flex-wrap'
  }`
/** A guest's allergen (#209): an outline in the accent colour; the row's words say who and what. */
export const GUEST_OUTLINE = 'outline outline-2 outline-offset-1 outline-accent'

/**
 * A closed recipe row's ingredients: every one by name, as flat read-only chips (#191).
 * A plain list, not controls: no checkbox, amount or chevron, and nothing to focus.
 * On a phone card (`scroll`) they stay on one row, so one recipe does not grow to the
 * screen and sit under the FAB (#192).
 */
const NONE: ReadonlySet<string> = new Set()

/** An outline in the accent colour (3:1 on the page), drawn outside the chip; text says it too (#206). */
const FLAGGED = 'outline outline-2 outline-offset-1 outline-accent'

export const IngredientNames: FC<{
  lines: readonly CopyLine[]
  title: string
  scroll: boolean
  /** ingredient ids to outline (#206): the missing ones, as far as the dial goes */
  flagged?: ReadonlySet<string> | undefined
}> = ({ lines, title, scroll, flagged = NONE }) => {
  const t = useT()
  const guestFlagged = flaggedIngredientIds(lines, useGuestList())
  return (
    <ul
      aria-label={t('row.ingredientsIn', { title })}
      data-testid="ingredient-names"
      className={namesClass(scroll)}
      {...(scroll ? { tabIndex: 0 } : {})}
    >
      {lines.map((line) => {
        const isMissing = flagged.has(line.ingredientId)
        const isGuest = guestFlagged.has(line.ingredientId)
        return (
          <li
            key={line.ingredientId}
            data-name-chip={line.ingredientId}
            data-guest-flag={isGuest ? 'true' : undefined}
            data-flagged={String(isMissing)}
            className={[
              nameChipClass(line),
              ...(scroll ? ['shrink-0'] : []),
              ...(isMissing || isGuest ? [FLAGGED] : [])
            ].join(' ')}
          >
            <span className="inline-flex items-center gap-1">
              {line.item !== null && <IngredientPicture id={line.item.id} />}
              {displayName(line)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
