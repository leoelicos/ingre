import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FOCUS_SHOP_BAR, START_NEW_STATE } from '../ShoppingList/ShoppingFlow'
import { useShoppingList } from '../../utils/shopping/useShoppingList'
import { changeTitle } from '../../utils/changeTitle'
import '../ShoppingList/shoppingList.css'

export const inBasketLine = (n: number) =>
  `${n} ${n === 1 ? 'item is' : 'items are'} in the basket`

export const stillToBuyLine = (n: number) =>
  n === 1 ? '1 is still to buy' : `${n} are still to buy`

/** After "I'm done shopping": the counts, never the checklist again. */
const TapOff: FC = () => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    changeTitle('Shopping done')
    titleRef.current?.focus()
  }, [])
  const list = useShoppingList()
  const navigate = useNavigate()
  const total = list.toBuy.length
  const left = list.leftToBuy
  return (
    <main className="list-page done-screen">
      <h1
        className="list-title"
        ref={titleRef}
        tabIndex={-1}
      >
        Shopping done
      </h1>
      <p>{inBasketLine(total - left)}</p>
      <p>{stillToBuyLine(left)}</p>
      <button
        type="button"
        className="btn btn-primary done-screen__start"
        onClick={() => navigate('/', { state: START_NEW_STATE })}
      >
        Start a new list
      </button>
      <Link
        className="done-screen__back"
        to="/"
        state={FOCUS_SHOP_BAR}
      >
        Back to my list
      </Link>
    </main>
  )
}
export default TapOff
