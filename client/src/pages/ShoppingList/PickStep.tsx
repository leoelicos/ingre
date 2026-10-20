import type { FC } from 'react'
import { BOTTOM_BAR, measureBar } from '../../utils/measureBar'
import { useMemo, useState } from 'react'
import { ServesPicker } from '../../components/ServesPicker'
import {
  PickCardGrid,
  pickId
} from '../../components/Widgets/RecipeCard/PickCard'
import searchLibrary, {
  getLibraryTags
} from '../../utils/library/recipeLibrary'
import type { ClientRecipe } from '../../types/client'
import type { ShoppingListState } from '../../utils/shopping/useShoppingList'
import { readFavourites } from '../../utils/storage/favourites'
import { PrimaryButton } from '../../components/PrimaryButton'
import { orderTags, toggleTag } from '../Home/homeFilters'
import { EmptySearch } from '../Home/EmptySearch'
import { PickFilters } from './PickFilters'

export const recipeCount = (n: number) =>
  `${n} ${n === 1 ? 'recipe' : 'recipes'}`

/** Shown before anything is picked, while Next is disabled. Wording for Charlie to confirm. */
export const PICK_START_HINT = 'Tap a recipe to pick it'

/** Shown once a recipe is picked (#157): where you are and what to do next. Charlie owns it. */
export const PICK_NEXT_HINT =
  'Step 1 of 3: Pick. Next, check what you have at home'

/** The Saved filter is on but nothing has a heart yet (#160). */
export const NO_SAVED_HINT =
  'No saved recipes yet. Search for a recipe, open it and tap its heart to save it. It will show here.'

/** The hint for how many recipes are picked; it only changes between none and some. */
export const pickHint = (picked: number): string =>
  picked === 0 ? PICK_START_HINT : PICK_NEXT_HINT

const PICK_HINT_ID = 'pick-next-hint'

/** What the Pick filters ask for: header search text, tags and Saved. */
export interface PickFilter {
  query: string
  tags: readonly string[]
  savedOnly: boolean
  savedIds: ReadonlySet<string>
}

/** Recipes matching the search and every tag, and only hearted ones when Saved is on. */
export const filterRecipes = (filter: PickFilter): ClientRecipe[] =>
  searchLibrary({ q: filter.query, tags: [...filter.tags] }).filter(
    (recipe) => !filter.savedOnly || filter.savedIds.has(pickId(recipe))
  )

/** Which empty state to show, if any. */
export type PickEmpty = 'none' | 'no-saved' | 'search' | 'no-match'

export const pickEmpty = (
  filter: PickFilter,
  shown: readonly ClientRecipe[]
): PickEmpty =>
  shown.length > 0
    ? 'none'
    : filter.savedOnly && filter.savedIds.size === 0
    ? 'no-saved'
    : filter.query.trim() !== ''
    ? 'search'
    : 'no-match'

const PickResults: FC<{
  list: ShoppingListState
  filter: PickFilter
}> = ({ list, filter }) => {
  const recipes = filterRecipes(filter)
  const empty = pickEmpty(filter, recipes)
  if (empty === 'no-saved')
    return (
      <p
        className="recipe-grid__status"
        role="status"
      >
        {NO_SAVED_HINT}
      </p>
    )
  if (empty === 'search')
    return (
      <EmptySearch
        query={filter.query}
        list={{
          extras: list.extras,
          onAdd: list.addExtra,
          onViewList: () => list.setStep('home')
        }}
      />
    )
  if (empty === 'no-match')
    return (
      <p
        className="recipe-grid__status"
        role="status"
      >
        No recipes
      </p>
    )
  return (
    <PickCardGrid
      recipes={recipes}
      pick={{ pickedIds: list.pickedIds, onToggle: list.togglePicked }}
    />
  )
}

/** Step 1: choose what to cook, filtered by the header search, tags and Saved. */
export const PickStep: FC<{
  list: ShoppingListState
  query: string
  savedOnly: boolean
  onSavedOnly: (on: boolean) => void
}> = ({ list, query, savedOnly, onSavedOnly }) => {
  const tags = useMemo(() => orderTags(getLibraryTags()), [])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  /** hearts are set on the recipe page, so reading them as Pick opens is enough */
  const savedIds = useMemo(readFavourites, [])
  const canContinue = list.recipes.length > 0
  return (
    <>
      <div className="list-controls">
        <ServesPicker
          people={list.people}
          onChange={list.setPeople}
        />
      </div>
      <PickFilters
        tags={tags}
        selectedTags={selectedTags}
        onToggleTag={(tag) => setSelectedTags((prev) => toggleTag(prev, tag))}
        savedOnly={savedOnly}
        onSavedOnly={onSavedOnly}
      />
      <div className="pick-grid">
        <PickResults
          list={list}
          filter={{ query, tags: selectedTags, savedOnly, savedIds }}
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
            onPress={() => list.setStep('home')}
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
