import type { FC } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ServesPicker } from '../../components/ServesPicker'
import type { ShoppingListState } from '../../utils/shopping/useShoppingList'
import { IngreIconPrint } from '../../lib/icon/Icon'
import { AddItem } from './AddItem'
import { LineGroups } from './LineGroups'
import type { LocationMode } from './ListRow'

export const tapLabel = (n: number) => `Tap ${n} ${n === 1 ? 'item' : 'items'}`

/** "At home" (check your kitchen) or "At the shop" (to buy) over the same list. */
export const ShoppingListView: FC<{
  list: ShoppingListState
  view: 'home' | 'shop'
  onPrint: () => void
}> = ({ list, view, onPrint }) => {
  const [haveOpen, setHaveOpen] = useState(false)
  const atHome = view === 'home'
  const locationMode: LocationMode = atHome ? 'move' : 'chip'
  const rowActions = {
    grouping: view,
    locationMode,
    onLocation: list.setLocation,
    onQuantity: list.setExtraQuantity
  }

  return (
    <>
      <div className="list-controls">
        <ServesPicker
          people={list.people}
          onChange={list.setPeople}
        />
        <button
          type="button"
          className="print-button"
          onClick={onPrint}
          disabled={list.toBuy.length === 0}
        >
          <IngreIconPrint /> Print
        </button>
      </div>
      <AddItem onAdd={list.addExtra} />

      {list.lineCount === 0 ? (
        <p className="list-empty">
          Nothing on your list yet.{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => list.setStep('pick')}
          >
            Pick some recipes
          </button>{' '}
          or add an item above.
        </p>
      ) : (
        <>
          <h2 className="list-heading">
            {atHome ? 'Check your kitchen' : 'To buy'}
          </h2>
          {atHome && <p className="list-note">Tick what you already have</p>}
          {list.toBuy.length === 0 ? (
            <p className="list-empty">Nothing to buy. You have it all.</p>
          ) : (
            <LineGroups
              {...rowActions}
              lines={list.toBuy}
              checkedIds={atHome ? new Set() : list.basketIds}
              struck={!atHome}
              onToggle={atHome ? list.toggleHave : list.toggleBasket}
            />
          )}
        </>
      )}

      {list.alreadyHave.length > 0 && (
        <section className="list-have">
          <h2 className="list-heading">
            <button
              type="button"
              className="list-have__toggle"
              aria-expanded={haveOpen}
              onClick={() => setHaveOpen(!haveOpen)}
            >
              Already have ({list.alreadyHave.length})
            </button>
          </h2>
          {haveOpen && (
            <>
              {list.alreadyHave.some((l) => l.staple) && (
                <p className="list-note">
                  We assumed you have these. Untick anything you need to buy.
                </p>
              )}
              <LineGroups
                {...rowActions}
                lines={list.alreadyHave}
                checkedIds={list.haveIds}
                struck={false}
                onToggle={list.toggleHave}
              />
            </>
          )}
        </section>
      )}

      <div className="list-tap">
        {atHome ? (
          <button
            type="button"
            className="btn btn-primary list-tap__button"
            onClick={() => list.setStep('shop')}
          >
            Next: at the shop ({list.toBuy.length} to buy)
          </button>
        ) : (
          list.toBuy.length > 0 && (
            <Link
              to="/tapoff"
              className="btn btn-primary list-tap__button"
            >
              {tapLabel(list.toBuy.length)}
            </Link>
          )
        )}
      </div>
    </>
  )
}
