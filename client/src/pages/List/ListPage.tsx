import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import type { ChipsState } from '../../utils/chips/useChips'
import { useChips } from '../../utils/chips/useChips'
import { focusById } from '../../utils/focus'
import { readFavourites } from '../../utils/storage/favourites'
import { EmptySearch } from './EmptySearch'
import {
  INGREDIENTS_HEADING_ID,
  INGREDIENTS_ID,
  Ingredients
} from './Ingredients'
import type { RecipeFilter } from './recipeFilter'
import {
  NO_SAVED_HINT,
  filterRecipes,
  recipeCount,
  recipesEmpty
} from './recipeFilter'
import { RecipeRows } from './RecipeRows'
import { SavedFilter } from './SavedFilter'
import { ScrollToTop } from './ScrollToTop'
import { Section } from './Section'

/** "?q=" from the header search and "?saved=1" from the Saved filter or old Saved links. */
export const listParams = (
  params: URLSearchParams
): { query: string; savedOnly: boolean } => ({
  query: params.get('q') ?? '',
  savedOnly: params.get('saved') === '1'
})

/** The params with the Saved filter switched on or off; everything else is kept. */
export const withSaved = (
  params: URLSearchParams,
  on: boolean
): URLSearchParams => {
  const next = new URLSearchParams(params)
  if (on) next.set('saved', '1')
  else next.delete('saved')
  return next
}

/** A set with one id added, or removed when it is already there. */
export const toggled = (
  ids: ReadonlySet<string>,
  id: string
): ReadonlySet<string> =>
  new Set(ids.has(id) ? [...ids].filter((x) => x !== id) : [...ids, id])

const STATUS = 'm-0 text-text-secondary'

/** The rows, or the empty state that fits the search and the Saved filter. */
const RecipeResults: FC<{ list: ChipsState; filter: RecipeFilter }> = ({
  list,
  filter
}) => {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set())
  const loggedIn = useAuthContext()[0].loggedIn
  const recipes = filterRecipes(filter)
  const empty = recipesEmpty(filter, recipes)
  if (empty === 'no-saved')
    return (
      <p
        className={STATUS}
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
          hasChip: list.hasChip,
          onAdd: list.addExtra,
          onViewList: () => focusById(INGREDIENTS_HEADING_ID)
        }}
      />
    )
  if (empty === 'no-match')
    return (
      <p
        className={STATUS}
        role="status"
      >
        No recipes
      </p>
    )
  return (
    <RecipeRows
      recipes={recipes}
      controls={{
        pickedIds: list.pickedIds,
        onTogglePicked: list.togglePicked,
        openIds,
        onToggleOpen: (id) => setOpenIds((ids) => toggled(ids, id)),
        people: list.people,
        onPeople: list.setPeople,
        canSave: loggedIn
      }}
    />
  )
}

/**
 * The one page (#179): Ingredients (chips by category) above Recipes (rows). Picks, crossed
 * off chips, edits, extras and chip order are kept on this device, so a refresh keeps them.
 */
export const ListPage: FC = () => {
  useEffect(() => changeTitle('Shopping list'), [])
  const list = useChips()
  const [params, setParams] = useSearchParams()
  const { query, savedOnly } = listParams(params)
  const [ingredientsOpen, setIngredientsOpen] = useState(true)
  const [recipesOpen, setRecipesOpen] = useState(true)
  return (
    <main className="mx-auto flex w-full max-w-layout flex-col gap-8 px-gutter pb-24 pt-4">
      <h1 className="sr-only">Shopping list</h1>
      <Ingredients
        list={list}
        open={ingredientsOpen}
        onToggle={() => setIngredientsOpen(!ingredientsOpen)}
      />
      <Section
        id="recipes"
        title="Recipes"
        open={recipesOpen}
        onToggle={() => setRecipesOpen(!recipesOpen)}
        summary={`${recipeCount(list.recipes.length)} picked`}
      >
        <div className="flex flex-col gap-4">
          <SavedFilter
            on={savedOnly}
            onChange={(on) => setParams(withSaved(params, on))}
          />
          <RecipeResults
            list={list}
            filter={{ query, savedOnly, savedIds: readFavourites() }}
          />
        </div>
      </Section>
      <ScrollToTop
        watchId={INGREDIENTS_ID}
        headingId={INGREDIENTS_HEADING_ID}
      />
    </main>
  )
}
