import type { FC } from 'react'
import { BOTTOM_BAR, measureBar } from '../../utils/measureBar'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServesPicker } from '../../components/ServesPicker'
import { PrimaryButton } from '../../components/PrimaryButton'
import type {
  ShoppingListState,
  UnsavedTicks
} from '../../utils/shopping/useShoppingList'
import {
  IngreIconChevronDown,
  IngreIconPrint,
  IngreIconBasket
} from '../../lib/icon/Icon'
import { AddItem } from './AddItem'
import { ShoppingChips } from './ShoppingChips'
import type { ShopLine } from '../../utils/shopping/shoppingList'
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

/** To buy, less anything just ticked at home (still on its 2s Undo clock), so chips update live. */
export const stillNeeded = (
  toBuy: readonly ShopLine[],
  checkedAtHome: ReadonlySet<string>
): ShopLine[] => toBuy.filter((line) => !checkedAtHome.has(line.ingredientId))

/** Still to buy and not in the basket, counting ticks still on the clock, for the Next count. */
export const leftToBuyNow = (
  toBuy: readonly ShopLine[],
  checkedAtHome: ReadonlySet<string>,
  basketIds: ReadonlySet<string>
): number =>
  stillNeeded(toBuy, checkedAtHome).filter(
    (line) => !basketIds.has(line.ingredientId)
  ).length

/** "At home" (check your kitchen) or "At the shop" (to buy) over the same list. */
export const ShoppingListView: FC<{
  list: ShoppingListState
  view: 'home' | 'shop'
  onPrint: () => void
  /** gets the ticks still waiting on the tick clock, so Undo can bring them back */
  onStartNew: (unsaved: UnsavedTicks) => void
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
  const startNew = (): void =>
    onStartNew({
      haveIds: homeTicks.takeUnsaved(),
      basketIds: shopTicks.takeUnsaved()
    })
  /** At home the Next count follows a tick at once, before the 2s clock saves it. */
  const nextCount = leftToBuyNow(
    list.toBuy,
    homeTicks.checkedIds,
    list.basketIds
  )
  const locationMode: LocationMode = atHome ? 'move' : 'none'
  const shopBar = !atHome
  const nothingLeft = list.toBuy.length === 0
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
      {list.lineCount > 0 && (
        <ShoppingChips
          lines={
            atHome ? stillNeeded(list.toBuy, homeTicks.checkedIds) : list.toBuy
          }
        />
      )}

      {list.lineCount === 0 ? (
        <p className="list-empty">
          Nothing on your list yet.{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              list.setStep('pick')
            }}
          >
            Pick some recipes
          </button>{' '}
          or add an item above.
        </p>
      ) : (
        <>
          {!complete && (
            <h2 className="list-heading">
              {atHome ? (
                'Check your kitchen'
              ) : (
                <>
                  <IngreIconBasket /> To buy
                </>
              )}
            </h2>
          )}
          {!atHome && list.toBuy.length > 0 && (
            <p
              className="list-basket-count"
              aria-live="polite"
            >
              {basketCount(inBasket, list.toBuy.length)}
            </p>
          )}
          {atHome && <p className="list-note">Tick what you already have</p>}
          {complete && <AllDone onStart={startNew} />}
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
      {list.lineCount > 0 && !complete && <StartNewList onStart={startNew} />}

      <div
        className={shopBar ? 'list-tap list-tap--split' : 'list-tap'}
        ref={measureBar(BOTTOM_BAR)}
      >
        {atHome ? (
          <PrimaryButton
            onPress={() => {
              list.setStep('shop')
            }}
            className="list-tap__button w-full"
          >
            Next: at the shop ({nextCount})
          </PrimaryButton>
        ) : (
          shopBar && (
            <>
              <span className="list-tap__count">
                {nothingLeft
                  ? 'Nothing left to buy'
                  : basketCount(inBasket, list.toBuy.length)}
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
