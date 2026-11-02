import { useT } from '../../i18n'
import type { FC } from 'react'
import type { CopyLine } from '../../utils/balance/copies'
import { startSection } from '../../utils/chips/chips'
import { displayName } from '../../utils/shopping/shoppingList'
import { edgeToneOf } from './Chips'

/** A read-only chip's look: the chip's section edge, flat (no shadow), just the name. */
export const nameChipClass = (line: CopyLine): string =>
  `rounded-pill border px-3 py-1 text-sm font-semibold leading-tight ${edgeToneOf(
    startSection(line.item)
  )}`

/**
 * A closed recipe row's ingredients: every one by name, as flat read-only chips (#191).
 * A plain list, not controls: no checkbox, amount or chevron, and nothing to focus.
 */
const NONE: ReadonlySet<string> = new Set()

/** An outline in the accent colour (3:1 on the page), drawn outside the chip; text says it too (#206). */
const FLAGGED = 'outline outline-2 outline-offset-1 outline-accent'

export const IngredientNames: FC<{
  lines: readonly CopyLine[]
  title: string
  /** ingredient ids to outline (#206): the missing ones, as far as the dial goes */
  flagged?: ReadonlySet<string> | undefined
}> = ({ lines, title, flagged = NONE }) => {
  const t = useT()
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
          data-flagged={String(flagged.has(line.ingredientId))}
          className={[
            nameChipClass(line),
            ...(flagged.has(line.ingredientId) ? [FLAGGED] : [])
          ].join(' ')}
        >
          {displayName(line)}
        </li>
      ))}
    </ul>
  )
}
