import type { FC } from 'react'
import { useId } from 'react'
import type { ClientRecipe } from '../../../types/client'
import {
  KeyIngredientLines,
  keyNameIds
} from '../../IngredientBadge/KeyIngredients'
import { keyIngredientsFor } from '../../../utils/library/keyIngredients'
import type { PickControls } from './RecipeCardContainer'
import { recipeKey, splitTitle } from './recipeCardHelpers'
import './recipeCard.css'

/** Shown on a picked card; the state itself is announced from aria-pressed. */
export const PICKED_MARK = '✓ Picked'

const CARD =
  'relative flex h-full w-full flex-col gap-3 rounded-card border-2 border-transparent bg-surface p-4 text-left shadow-card focus-visible:focus-ring aria-pressed:border-primary aria-pressed:bg-chip-active'

/** Library id when there is one, else the name: what the pick list stores. */
export const pickId = (recipe: Pick<ClientRecipe, 'libraryId' | 'name'>) =>
  recipe.libraryId ?? recipe.name

/**
 * Pick screen card (#156): only the title and the key ingredient badges, and the whole card is
 * one real toggle button. Named by its title; described by the full ingredient names (#155).
 */
export const PickCard: FC<{ recipe: ClientRecipe; pick: PickControls }> = ({
  recipe,
  pick
}) => {
  const id = useId()
  const titleId = `${id}-title`
  const { title } = splitTitle(recipe.name)
  const items = keyIngredientsFor(recipe.libraryId)
  const describedBy = keyNameIds(id, items)
  const picked = pick.pickedIds.has(pickId(recipe))
  return (
    <button
      type="button"
      className={CARD}
      aria-pressed={picked}
      aria-labelledby={titleId}
      {...(describedBy === '' ? {} : { 'aria-describedby': describedBy })}
      onClick={() => pick.onToggle(pickId(recipe))}
    >
      <span
        id={titleId}
        className="text-lg font-semibold leading-snug text-text"
      >
        {title}
      </span>
      <KeyIngredientLines
        items={items}
        idPrefix={id}
      />
      {picked && (
        <span
          aria-hidden="true"
          className="mt-auto self-start rounded-pill bg-surface px-3 py-1 text-sm font-semibold text-added-pill"
        >
          {PICKED_MARK}
        </span>
      )}
    </button>
  )
}

/** The Pick screen's grid of toggle cards. */
export const PickCardGrid: FC<{
  recipes: readonly ClientRecipe[]
  pick: PickControls
}> = ({ recipes, pick }) => (
  <ul className="recipe-grid">
    {recipes.map((recipe) => (
      <li key={recipeKey(recipe)}>
        <PickCard
          recipe={recipe}
          pick={pick}
        />
      </li>
    ))}
  </ul>
)
