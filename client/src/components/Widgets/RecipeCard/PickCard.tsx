import type { FC } from 'react'
import { useId } from 'react'
import { Link } from 'react-router-dom'
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
  'relative flex flex-1 w-full flex-col gap-3 rounded-card border-2 border-transparent bg-surface p-4 text-left shadow-card focus-visible:focus-ring aria-pressed:border-primary aria-pressed:bg-chip-active'

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

export const VIEW_RECIPE = 'View recipe'

/** The accessible name of a card's recipe link: the visible text plus the title. */
export const viewRecipeLabel = (title: string): string =>
  `${VIEW_RECIPE}: ${title}`

/**
 * "View recipe": opens the recipe page, where the heart lives. A sibling after the toggle
 * button (never inside it), so the tab order is card, then its link. Library recipes only.
 */
export const ViewRecipeLink: FC<{ recipe: ClientRecipe }> = ({ recipe }) =>
  recipe.libraryId === undefined ? null : (
    <Link
      to={`/recipe/${recipe.libraryId}`}
      aria-label={viewRecipeLabel(splitTitle(recipe.name).title)}
      className="inline-flex min-h-[44px] items-center self-start rounded-control px-1 text-sm font-semibold text-primary focus-visible:focus-ring"
    >
      {VIEW_RECIPE}
    </Link>
  )

/** The Pick screen's grid of toggle cards, each followed by its View recipe link. */
export const PickCardGrid: FC<{
  recipes: readonly ClientRecipe[]
  pick: PickControls
}> = ({ recipes, pick }) => (
  <ul className="recipe-grid">
    {recipes.map((recipe) => (
      <li
        key={recipeKey(recipe)}
        className="flex flex-col gap-1"
      >
        <PickCard
          recipe={recipe}
          pick={pick}
        />
        <ViewRecipeLink recipe={recipe} />
      </li>
    ))}
  </ul>
)
