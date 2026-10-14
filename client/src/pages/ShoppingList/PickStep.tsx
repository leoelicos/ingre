import type { FC } from 'react'
import { useMemo } from 'react'
import { ServesPicker } from '../../components/ServesPicker'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import searchLibrary from '../../utils/library/recipeLibrary'
import type { ShoppingListState } from '../../utils/shopping/useShoppingList'

export const recipeCount = (n: number) =>
  `${n} ${n === 1 ? 'recipe' : 'recipes'}`

/** Step 1: choose what to cook. */
export const PickStep: FC<{ list: ShoppingListState }> = ({ list }) => {
  const recipes = useMemo(() => searchLibrary(), [])
  return (
    <>
      <div className="list-controls">
        <ServesPicker
          people={list.people}
          onChange={list.setPeople}
        />
      </div>
      <RecipeCardContainer
        results={recipes}
        loading={false}
        onSavedPage={false}
        pick={{ pickedIds: list.pickedIds, onToggle: list.togglePicked }}
      />
      <div className="list-tap list-tap--split">
        <span className="list-tap__count">
          {recipeCount(list.recipes.length)}
        </span>
        <button
          type="button"
          className="btn btn-primary list-tap__button"
          onClick={() => list.setStep('home')}
        >
          Next: check your kitchen ({list.lineCount} items)
        </button>
      </div>
    </>
  )
}
