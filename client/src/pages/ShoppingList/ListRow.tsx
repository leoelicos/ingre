import type { FC } from 'react'
import { useRef, useState } from 'react'
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

/**
 * The source line ("for red lentil dahl"). While a tick waits, the pending label is drawn over
 * it in the same grid cell, so the row keeps its height and nothing below moves under the
 * pointer. The source stays in the checkbox's name (opacity only); the overlay is aria-hidden.
 */
export const SourceLine: FC<{ source: string; pendingLabel: string }> = ({
  source,
  pendingLabel
}) => (
  <span className="grid">
    <small
      className={
        pendingLabel === ''
          ? 'col-start-1 row-start-1'
          : 'col-start-1 row-start-1 opacity-0'
      }
    >
      {source}
    </small>
    {pendingLabel !== '' && (
      <small
        aria-hidden="true"
        className="col-start-1 row-start-1"
      >
        {pendingLabel}
      </small>
    )}
  </span>
)

/**
 * Undo for a waiting tick, in the 44px slot the Details chevron uses, so the row never grows.
 * Its status is announced, not drawn (the label is drawn by SourceLine).
 */
export const UndoSlot: FC<{
  name: string
  pendingLabel: string
  onUndo: () => void
}> = ({ name, pendingLabel, onUndo }) => (
  <>
    <span
      role="status"
      className="sr-only"
    >
      {`${name}: ${pendingLabel}`}
    </span>
    <button
      type="button"
      className="list-row__more w-11 px-0 text-sm font-semibold text-primary underline focus-visible:focus-ring"
      aria-label={`Undo ${name}`}
      onClick={onUndo}
    >
      Undo
    </button>
  </>
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
  const box = useRef<HTMLInputElement>(null)
  const name = displayName(line)
  const need = needLabel(line)
  const location = line.location
  const id = line.ingredientId
  const checked = ticks.checkedIds.has(id)
  const pending = ticks.pendingIds.has(id)
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
            ref={box}
            type="checkbox"
            checked={checked}
            onChange={() => ticks.onToggle(id)}
            className="focus-visible:focus-ring"
          />
          <span className="list-row__text">
            <span className="list-row__line">
              <span className="list-row__name">{name}</span>
              {!amountInStepper(line) && (
                <span className="list-row__amount">{buyAmount(line)}</span>
              )}
            </span>
            <SourceLine
              source={sourceLabel(line)}
              pendingLabel={pending ? ticks.pendingLabel : ''}
            />
          </span>
        </label>
        {line.extraQuantity !== null && (
          <Stepper
            name={line.name}
            quantity={line.extraQuantity}
            onChange={(quantity) => onQuantity(line.ingredientId, quantity)}
          />
        )}
        {pending ? (
          <UndoSlot
            name={line.name}
            pendingLabel={ticks.pendingLabel}
            onUndo={() => {
              ticks.onUndo(id)
              ;[box.current]
                .filter((el) => el !== null)
                .forEach((el) => el.focus())
            }}
          />
        ) : (
          <button
            type="button"
            className="list-row__more focus-visible:focus-ring"
            aria-expanded={expanded}
            aria-label={`Details for ${line.name}`}
            onClick={() => setExpanded(!expanded)}
          >
            <IngreIconChevronDown />
          </button>
        )}
      </div>
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
