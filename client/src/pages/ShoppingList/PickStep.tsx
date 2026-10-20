import type { FC } from 'react'
import { BOTTOM_BAR, measureBar } from '../../utils/measureBar'
import { useMemo } from 'react'
import { ServesPicker } from '../../components/ServesPicker'
import { PickCardGrid } from '../../components/Widgets/RecipeCard/PickCard'
import searchLibrary from '../../utils/library/recipeLibrary'
import type { ShoppingListState } from '../../utils/shopping/useShoppingList'
import { PrimaryButton } from '../../components/PrimaryButton'

export const recipeCount = (n: number) =>
  `${n} ${n === 1 ? 'recipe' : 'recipes'}`

/** Shown before anything is picked, while Next is disabled. Wording for Charlie to confirm. */
export const PICK_START_HINT = 'Tap a recipe to pick it'

/** Shown once a recipe is picked (#157): where you are and what to do next. Charlie owns it. */
export const PICK_NEXT_HINT =
  'Step 1 of 3: Pick. Next, check what you have at home'

/** The hint for how many recipes are picked; it only changes between none and some. */
export const pickHint = (picked: number): string =>
  picked === 0 ? PICK_START_HINT : PICK_NEXT_HINT

const PICK_HINT_ID = 'pick-next-hint'

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
        <PickCardGrid
          recipes={recipes}
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
            ariaDescribedBy={PICK_HINT_ID}
            className="list-tap__button w-full"
          >
            Next: check at home ({list.lineCount})
          </PrimaryButton>
          {/* Always rendered polite status: a change is announced without moving focus. */}
          <p
            id={PICK_HINT_ID}
            className="list-tap__hint"
            role="status"
          >
            {pickHint(list.recipes.length)}
          </p>
        </div>
      </div>
    </>
  )
}
