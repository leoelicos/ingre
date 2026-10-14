import type { FC } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineGroups } from '../ShoppingList/LineGroups'
import { useShoppingList } from '../../utils/shopping/useShoppingList'
import { changeTitle } from '../../utils/changeTitle'
import '../../styles/segmented.css'
import '../ShoppingList/shoppingList.css'

/** At the shop: the to-buy items by section; ticks share the list's basket. */
const TapOff: FC = () => {
  useEffect(() => changeTitle('In the shop'), [])
  const list = useShoppingList()
  const left = list.leftToBuy
  return (
    <main className="list-page">
      <h1 className="list-title">In the shop</h1>
      {list.toBuy.length === 0 ? (
        <p className="list-empty">
          Nothing to tap off yet. <Link to="/ingredients">Shopping list</Link>
        </p>
      ) : (
        <>
          <p className="list-note">
            {left === 0 ? 'All done!' : `${left} left to find`}
          </p>
          <LineGroups
            lines={list.toBuy}
            grouping="shop"
            checkedIds={list.basketIds}
            struck={true}
            onToggle={list.toggleBasket}
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
