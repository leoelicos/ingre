import type { FC } from 'react'
import { useState } from 'react'
import { IngreIconChevronDown } from '../../lib/icon/Icon'
import type { HomeLocation } from '../../types/library'
import type { ShopLine } from '../../utils/shopping/shoppingList'
import {
  forLabel,
  needLabel,
  partLabel,
  shopLabel
} from '../../utils/shopping/shoppingList'
import { LocationMenu } from './LocationMenu'

/** One list item: the whole row toggles; the chevron shows the breakdown. */
export const ListRow: FC<{
  line: ShopLine
  checked: boolean
  struck: boolean
  onToggle: (ingredientId: string) => void
  onLocation: ((id: string, location: HomeLocation) => void) | null
}> = ({ line, checked, struck, onToggle, onLocation }) => {
  const [expanded, setExpanded] = useState(false)
  const label = shopLabel(line)
  return (
    <li className={struck && checked ? 'list-row list-row--done' : 'list-row'}>
      <div className="list-row__main">
        <label className="list-row__toggle">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(line.ingredientId)}
          />
          <span className="list-row__text">
            <strong>{label}</strong>
            <small>{forLabel(line.recipes)}</small>
          </span>
        </label>
        {onLocation !== null && (
          <LocationMenu
            name={line.name}
            location={line.location}
            onChange={(location) => onLocation(line.ingredientId, location)}
          />
        )}
        <button
          type="button"
          className="list-row__more"
          aria-expanded={expanded}
          aria-label={`Details for ${line.name}`}
          onClick={() => setExpanded(!expanded)}
        >
          <IngreIconChevronDown />
        </button>
      </div>
      {expanded && (
        <ul className="list-row__breakdown">
          {line.parts.map((part) => (
            <li key={part.recipe}>{partLabel(part)}</li>
          ))}
          <li>{needLabel(line)} in total</li>
        </ul>
      )}
    </li>
  )
}
