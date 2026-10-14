import type { FC } from 'react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AllDone } from '../ShoppingList/StartNewList'
import { START_NEW_STATE } from '../ShoppingList/ShoppingFlow'
import { LineGroups } from '../ShoppingList/LineGroups'
import { useShoppingList } from '../../utils/shopping/useShoppingList'
import { changeTitle } from '../../utils/changeTitle'
import { useDelayedTicks } from '../../utils/shopping/usePendingTicks'
import type { Timers } from '../../utils/shopping/usePendingTicks'
import '../../styles/segmented.css'
import '../ShoppingList/shoppingList.css'

/** At the shop: the to-buy items by section; ticks share the list's basket. */
const TapOff: FC<{ timers?: Timers }> = ({ timers }) => {
  useEffect(() => changeTitle('In the shop'), [])
  const list = useShoppingList()
  const left = list.leftToBuy
  const navigate = useNavigate()
  const ticks = useDelayedTicks(
    list.basketIds,
    list.addBasket,
    list.toggleBasket,
    'In basket',
    timers
  )
  return (
    <main className="list-page">
      <h1 className="list-title">In the shop</h1>
      {list.toBuy.length === 0 ? (
        <p className="list-empty">
          Nothing to tap off yet. <Link to="/ingredients">Shopping list</Link>
        </p>
      ) : (
        <>
          {left === 0 ? (
            <AllDone
              onStart={() =>
                navigate('/ingredients', { state: START_NEW_STATE })
              }
            />
          ) : (
            <p className="list-note">{`${left} left to find`}</p>
          )}
          <LineGroups
            lines={list.toBuy}
            grouping="shop"
            ticks={ticks}
            struck={true}
            locationMode="none"
            onLocation={list.setLocation}
            onQuantity={list.setExtraQuantity}
          />
        </>
      )}
    </main>
  )
}
export default TapOff
