import type { FC } from 'react'
import { BOTTOM_BAR, measureBar } from '../../utils/measureBar'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServesPicker } from '../../components/ServesPicker'
import { PrimaryButton } from '../../components/PrimaryButton'
import type { ShoppingListState } from '../../utils/shopping/useShoppingList'
import { IngreIconChevronDown, IngreIconPrint } from '../../lib/icon/Icon'
import { AddItem } from './AddItem'
import { AllDone, StartNewList } from './StartNewList'
import { LineGroups } from './LineGroups'
import type { LocationMode } from './ListRow'
import {
  instantTicks,
  useDelayedTicks
} from '../../utils/shopping/usePendingTicks'
import type { Timers } from '../../utils/shopping/usePendingTicks'

export const basketCount = (inBasket: number, total: number) =>
  `${inBasket} of ${total} in basket`

export const DONE_SHOPPING = "I'm done shopping"

export const SHOP_BAR_ID = 'shop-done-button'

/** "At home" (check your kitchen) or "At the shop" (to buy) over the same list. */
export const ShoppingListView: FC<{
  list: ShoppingListState
  view: 'home' | 'shop'
  onPrint: () => void
  onStartNew: () => void
  timers?: Timers
}> = ({ list, view, onPrint, onStartNew, timers }) => {
  const [haveOpen, setHaveOpen] = useState(false)
  const navigate = useNavigate()
  const atHome = view === 'home'
  const [basketOpen, setBasketOpen] = useState(false)
  /** at the shop with everything in the basket */
  const complete = !atHome && list.toBuy.length > 0 && list.leftToBuy === 0
  const homeTicks = useDelayedTicks(
    list.haveIds,
    list.addHave,
    list.toggleHave,
    'Moved to Already have',
    timers
  )
  const shopTicks = useDelayedTicks(
    list.basketIds,
    list.addBasket,
    list.toggleBasket,
    'In basket',
    timers
  )
  const locationMode: LocationMode = atHome ? 'move' : 'none'
  const shopBar = !atHome && list.toBuy.length > 0
  const inBasket = list.toBuy.length - list.leftToBuy
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
          className="print-button focus-visible:focus-ring"
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
          {!complete && (
            <h2 className="list-heading">
              {atHome ? 'Check your kitchen' : 'To buy'}
            </h2>
          )}
          {atHome && <p className="list-note">Tick what you already have</p>}
          {complete && <AllDone onStart={onStartNew} />}
          {complete ? (
            <section className="list-basket">
              <button
                type="button"
                className="list-have__toggle"
                aria-expanded={basketOpen}
                aria-controls="in-basket"
                onClick={() => setBasketOpen(!basketOpen)}
              >
                In basket ({list.toBuy.length})
                <span
                  className="list-have__chevron"
                  aria-hidden="true"
                >
                  <IngreIconChevronDown />
                </span>
              </button>
              {basketOpen && (
                <div id="in-basket">
                  <LineGroups
                    {...rowActions}
                    lines={list.toBuy}
                    ticks={shopTicks}
                    struck={true}
                  />
                </div>
              )}
            </section>
          ) : list.toBuy.length === 0 ? (
            <p className="list-empty">Nothing to buy. You have it all.</p>
          ) : (
            <LineGroups
              {...rowActions}
              lines={list.toBuy}
              ticks={atHome ? homeTicks : shopTicks}
              struck={!atHome}
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
              aria-controls={`have-${view}`}
              onClick={() => setHaveOpen(!haveOpen)}
            >
              Already have ({list.alreadyHave.length})
              <span
                className="list-have__chevron"
                aria-hidden="true"
              >
                <IngreIconChevronDown />
              </span>
            </button>
          </h2>
          {haveOpen && (
            <div id={`have-${view}`}>
              <LineGroups
                {...rowActions}
                lines={list.alreadyHave}
                ticks={instantTicks(list.haveIds, list.toggleHave)}
                struck={false}
              />
            </div>
          )}
        </section>
      )}

      {list.lineCount > 0 && (
        <p className="list-assumed">Assumed at home: {list.assumed}</p>
      )}
      {list.lineCount > 0 && !complete && <StartNewList onStart={onStartNew} />}

      <div
        className={shopBar ? 'list-tap list-tap--split' : 'list-tap'}
        ref={measureBar(BOTTOM_BAR)}
      >
        {atHome ? (
          <PrimaryButton
            onPress={() => list.setStep('shop')}
            className="list-tap__button w-full"
          >
            Next: at the shop ({list.leftToBuy})
          </PrimaryButton>
        ) : (
          shopBar && (
            <>
              <span className="list-tap__count">
                {basketCount(inBasket, list.toBuy.length)}
              </span>
              <PrimaryButton
                id={SHOP_BAR_ID}
                onPress={() => navigate('/tapoff')}
                className="list-tap__button"
              >
                {DONE_SHOPPING}
              </PrimaryButton>
            </>
          )
        )}
      </div>
    </>
  )
}
