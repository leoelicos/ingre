import type { FC } from 'react'
import { useState } from 'react'
import { IngreIconChevronDown } from '../../lib/icon/Icon'
import type { HomeLocation } from '../../types/library'
import { HOME_LOCATIONS } from '../../utils/library/parseLibrary'
import type { ShopLine } from '../../utils/shopping/shoppingList'
import {
  buyAmount,
  displayName,
  needLabel,
  partLabel,
  sourceLabel
} from '../../utils/shopping/shoppingList'
import type { TickState } from '../../utils/shopping/usePendingTicks'

/** How a row offers home-location changes: in the breakdown (at home), or not at all. */
export type LocationMode = 'move' | 'none'

/** An extra whose buy amount is just its stepper count: show the stepper only. */
export const amountInStepper = (
  line: Pick<ShopLine, 'buy' | 'extraQuantity'>
): boolean =>
  line.extraQuantity !== null && buyAmount(line) === String(line.extraQuantity)

export interface RowProps {
  line: ShopLine
  ticks: TickState
  struck: boolean
  locationMode: LocationMode
  onLocation: (id: string, location: HomeLocation) => void
  onQuantity: (lineId: string, quantity: number) => void
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

/** − n + for hand-added extras; − at 1 removes the item. */
const Stepper: FC<{
  name: string
  quantity: number
  onChange: (quantity: number) => void
}> = ({ name, quantity, onChange }) => (
  <div
    className="stepper"
    role="group"
    aria-label={`Quantity of ${name}`}
  >
    <button
      type="button"
      aria-label={quantity === 1 ? `Remove ${name}` : `Fewer ${name}`}
      onClick={() => onChange(quantity - 1)}
    >
      −
    </button>
    <span aria-live="polite">{quantity}</span>
    <button
      type="button"
      aria-label={`More ${name}`}
      onClick={() => onChange(quantity + 1)}
    >
      +
    </button>
  </div>
)

/** One list item: the whole row toggles; the chevron shows the breakdown. */
export const ListRow: FC<RowProps> = ({
  line,
  ticks,
  struck,
  locationMode,
  onLocation,
  onQuantity
}) => {
  const [expanded, setExpanded] = useState(false)
  const name = displayName(line)
  const need = needLabel(line)
  const location = line.location
  const id = line.ingredientId
  const checked = ticks.checkedIds.has(id)
  const className = [
    'list-row',
    struck && checked ? 'list-row--done' : '',
    ticks.leavingIds.has(id) ? 'list-row--leaving' : ''
  ]
    .filter((c) => c !== '')
    .join(' ')
  return (
    <li className={className}>
      <div className="list-row__main">
        <label className="list-row__toggle">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => ticks.onToggle(id)}
          />
          <span className="list-row__text">
            <span className="list-row__line">
              <span className="list-row__name">{name}</span>
              {!amountInStepper(line) && (
                <span className="list-row__amount">{buyAmount(line)}</span>
              )}
            </span>
            <small>{sourceLabel(line)}</small>
          </span>
        </label>
        {line.extraQuantity !== null && (
          <Stepper
            name={line.name}
            quantity={line.extraQuantity}
            onChange={(quantity) => onQuantity(line.ingredientId, quantity)}
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
      {ticks.pendingIds.has(id) && (
        <p
          className="list-row__pending"
          role="status"
        >
          {ticks.pendingLabel} ·{' '}
          <button
            type="button"
            className="link-button"
            aria-label={`Undo ${line.name}`}
            onClick={() => ticks.onUndo(id)}
          >
            Undo
          </button>
        </p>
      )}
      {expanded && (
        <div className="list-row__details">
          {(locationMode !== 'move' || line.recipes.length >= 2) &&
            line.parts.length > 0 && (
              <ul className="list-row__breakdown">
                {line.parts.map((part) => (
                  <li key={part.recipe}>{partLabel(part, line.name)}</li>
                ))}
                {need !== null && <li>{need} in total</li>}
              </ul>
            )}
          {locationMode === 'move' && location !== null && (
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
