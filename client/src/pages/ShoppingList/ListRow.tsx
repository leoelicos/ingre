import type { FC } from 'react'
import { useState } from 'react'
import { IngreIconChevronDown } from '../../lib/icon/Icon'
import type { HomeLocation } from '../../types/library'
import { HOME_LOCATIONS } from '../../utils/library/parseLibrary'
import type { ShopLine } from '../../utils/shopping/shoppingList'
import {
  buyAmount,
  displayName,
  forLabel,
  needLabel,
  partLabel
} from '../../utils/shopping/shoppingList'
import { LocationMenu } from './LocationMenu'

/** How a row offers home-location changes: in the breakdown, as a chip, or not at all. */
export type LocationMode = 'move' | 'chip' | 'none'

export interface RowProps {
  line: ShopLine
  checked: boolean
  struck: boolean
  onToggle: (ingredientId: string) => void
  locationMode: LocationMode
  onLocation: (id: string, location: HomeLocation) => void
}

const MoveTo: FC<Pick<RowProps, 'line' | 'onLocation'>> = ({
  line,
  onLocation
}) => (
  <div
    className="move-to"
    role="group"
    aria-label={`Move ${line.name} to`}
  >
    <span className="move-to__label">Move to:</span>
    {HOME_LOCATIONS.map((location) => (
      <button
        key={location}
        type="button"
        className="move-to__option"
        aria-pressed={line.location === location}
        onClick={() => onLocation(line.ingredientId, location)}
      >
        {location}
      </button>
    ))}
  </div>
)

/** One list item: the whole row toggles; the chevron shows the breakdown. */
export const ListRow: FC<RowProps> = ({
  line,
  checked,
  struck,
  onToggle,
  locationMode,
  onLocation
}) => {
  const [expanded, setExpanded] = useState(false)
  const name = displayName(line)
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
            <span className="list-row__line">
              <span className="list-row__name">{name}</span>
              <span className="list-row__amount">{buyAmount(line)}</span>
            </span>
            <small>{forLabel(line.recipes)}</small>
          </span>
        </label>
        {locationMode === 'chip' && (
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
        <div className="list-row__details">
          <ul className="list-row__breakdown">
            {line.parts.map((part) => (
              <li key={part.recipe}>{partLabel(part)}</li>
            ))}
            <li>{needLabel(line)} in total</li>
          </ul>
          {locationMode === 'move' && (
            <MoveTo
              line={line}
              onLocation={onLocation}
            />
          )}
        </div>
      )}
    </li>
  )
}
