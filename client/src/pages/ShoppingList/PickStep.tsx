import type { FC } from 'react'
import { BOTTOM_BAR, measureBar } from '../../utils/measureBar'
import { useMemo } from 'react'
import { ServesPicker } from '../../components/ServesPicker'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import searchLibrary from '../../utils/library/recipeLibrary'
import type { ShoppingListState } from '../../utils/shopping/useShoppingList'
import { PrimaryButton } from '../../components/PrimaryButton'

export const recipeCount = (n: number) =>
  `${n} ${n === 1 ? 'recipe' : 'recipes'}`

/**
 * Shown while Next is disabled. Wording from Charlie.
 */
export const PICK_NEXT_HINT = 'Tap + Add on a recipe to start'

const PICK_NEXT_HINT_ID = 'pick-next-hint'

/** Step 1: choose what to cook. */
export const PickStep: FC<{ list: ShoppingListState }> = ({ list }) => {
  const recipes = useMemo(() => searchLibrary(), [])
  const canContinue = list.recipes.length > 0
  const goHome = () => {
    list.setStep('home')
    document.getElementById('flow-tab-home')?.focus()
  }
  return (
    <>
      <div className="list-controls">
        <ServesPicker
          people={list.people}
          onChange={list.setPeople}
        />
      </div>
      <div className="pick-grid">
        <RecipeCardContainer
          results={recipes}
          loading={false}
          pick={{ pickedIds: list.pickedIds, onToggle: list.togglePicked }}
        />
      </div>
      <div
        className="list-tap list-tap--split"
        ref={measureBar(BOTTOM_BAR)}
      >
        <span className="list-tap__count">
          {recipeCount(list.recipes.length)}
        </span>
        <div className="list-tap__action">
          <PrimaryButton
            onPress={goHome}
            isDisabled={!canContinue}
            ariaDisabledOnly={!canContinue}
            ariaDescribedBy={canContinue ? undefined : PICK_NEXT_HINT_ID}
            className="list-tap__button w-full"
          >
            Next: check at home ({list.lineCount})
          </PrimaryButton>
          {!canContinue && (
            <p
              id={PICK_NEXT_HINT_ID}
              className="list-tap__hint"
            >
              {PICK_NEXT_HINT}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
