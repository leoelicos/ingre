import type { FC } from 'react'
import type { KeyIngredient } from '../../utils/library/keyIngredients'
import { IngredientBadge } from './IngredientBadge'

/** Id of a key ingredient's visible name, so a card can point its description at the names. */
export const keyNameId = (prefix: string, item: KeyIngredient): string =>
  `${prefix}-key-${item.id}`

/** Space-separated name ids for aria-describedby; empty when there are none. */
export const keyNameIds = (
  prefix: string,
  items: readonly KeyIngredient[]
): string => items.map((item) => keyNameId(prefix, item)).join(' ')

const ROW = 'flex items-center gap-2'

interface ListProps {
  readonly items: readonly KeyIngredient[]
  /** unique per screen (useId), for the name ids */
  readonly idPrefix: string
}

/**
 * Badge (decorative) beside the full name, with the shop section as small text under it,
 * because outside a grouped list colour must never be the only cue for the section.
 */
const KeyIngredientRow: FC<{ item: KeyIngredient; idPrefix: string }> = ({
  item,
  idPrefix
}) => (
  <>
    <IngredientBadge
      name={item.name}
      badgeCode={item.code}
      category={item.category}
    />
    <span className="flex min-w-0 flex-col">
      <span
        id={keyNameId(idPrefix, item)}
        className="break-words text-sm font-semibold leading-tight text-text"
      >
        {item.name}
      </span>
      <span className="text-xs leading-tight text-text-secondary">
        {item.section}
      </span>
    </span>
  </>
)

/** A real list of key ingredients (recipe page and browse cards). */
export const KeyIngredientList: FC<ListProps> = ({ items, idPrefix }) => (
  <ul className="m-0 flex list-none flex-col gap-2 p-0">
    {items.map((item) => (
      <li
        key={item.id}
        className={ROW}
      >
        <KeyIngredientRow
          item={item}
          idPrefix={idPrefix}
        />
      </li>
    ))}
  </ul>
)

/** The same rows as phrasing content, for inside a button (a list isn't allowed there). */
export const KeyIngredientLines: FC<ListProps> = ({ items, idPrefix }) => (
  <span className="flex flex-col gap-2">
    {items.map((item) => (
      <span
        key={item.id}
        className={ROW}
      >
        <KeyIngredientRow
          item={item}
          idPrefix={idPrefix}
        />
      </span>
    ))}
  </span>
)
