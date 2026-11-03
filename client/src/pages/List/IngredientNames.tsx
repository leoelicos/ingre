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

/** Closed-row names. A phone card scrolls them in one row so the card cannot fill the screen. */
export const namesClass = (scroll: boolean): string =>
  `col-span-2 m-0 flex list-none gap-2 pb-4 pl-14 pr-4 pt-0 ${
    scroll ? 'flex-nowrap overflow-x-auto' : 'flex-wrap'
  }`

/**
 * A closed recipe row's ingredients: every one by name, as flat read-only chips (#191).
 * A plain list, not controls: no checkbox, amount or chevron, and nothing to focus.
 * On a phone card (`scroll`) they stay on one row, so one recipe does not grow to the
 * screen and sit under the FAB (#192).
 */
export const IngredientNames: FC<{
  lines: readonly CopyLine[]
  title: string
  scroll: boolean
}> = ({ lines, title, scroll }) => {
  const t = useT()
  return (
    <ul
      aria-label={t('row.ingredientsIn', { title })}
      data-testid="ingredient-names"
      className={namesClass(scroll)}
      {...(scroll ? { tabIndex: 0 } : {})}
    >
      {lines.map((line) => (
        <li
          key={line.ingredientId}
          data-name-chip={line.ingredientId}
          className={`${nameChipClass(line)}${scroll ? ' shrink-0' : ''}`}
        >
          {displayName(line)}
        </li>
      ))}
    </ul>
  )
}
