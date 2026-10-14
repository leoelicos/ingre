import type { FC } from 'react'
import { Link } from 'react-router-dom'
import type { LibraryRecipe } from '../../types/library'
import { LineGroups } from '../ShoppingList/LineGroups'
import { SavedRecipesGate } from '../ShoppingList/SavedRecipesGate'
import { useShoppingList } from '../../utils/shopping/useShoppingList'

/** At the shop: the to-buy items by section; ticks share the list's basket. */
export const TapOffList: FC<{ recipes: readonly LibraryRecipe[] }> = ({
  recipes
}) => {
  const list = useShoppingList(recipes)
  const left = list.toBuy.filter((l) => !list.basketIds.has(l.ingredientId))
  if (list.toBuy.length === 0)
    return (
      <p className="list-empty">
        Nothing to tap off yet. <Link to="/ingredients">Shopping list</Link>
      </p>
    )
  return (
    <>
      <p className="list-note">
        {left.length === 0 ? 'All done!' : `${left.length} left to find`}
      </p>
      <LineGroups
        lines={list.toBuy}
        grouping="shop"
        checkedIds={list.basketIds}
        struck={true}
        onToggle={list.toggleBasket}
        locationMode="none"
        onLocation={list.setLocation}
      />
    </>
  )
}

const TapOff: FC = () => (
  <SavedRecipesGate title="Tap Off">
    {(recipes) => <TapOffList recipes={recipes} />}
  </SavedRecipesGate>
)
export default TapOff
