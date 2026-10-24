import type { FC } from 'react'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import { AllergenTags } from '../../components/AllergenTags'
import { Collapse } from '../../components/Collapse'
import { SEARCH_LABEL, SearchBox } from '../../components/SearchBox/SearchBox'
import { IngreIconSearch } from '../../lib/icon/Icon'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { categoryLabel } from '../../utils/chips/chips'
import { useExplore } from '../../utils/explore/ExploreContext'
import type {
  ExploreResults,
  ExploreSource
} from '../../utils/explore/exploreSearch'
import {
  DEFAULT_SOURCE,
  exploreResults,
  shownRecipes
} from '../../utils/explore/exploreSearch'
import { placeInShop } from '../../utils/shopping/sections'
import type { RecipeFilter } from '../../utils/filters/filters'
import {
  NO_RECIPE_FILTER,
  recipeFilterOn,
  recipeMatches
} from '../../utils/filters/filters'
import { library } from '../../utils/library/recipeLibrary'
import type { SavedState } from '../../utils/saved/useSaved'
import {
  ActionsRow,
  FilterButton,
  HiddenNote,
  RecipeFilterPanel
} from './Filters'
import type { IngredientsState } from './Ingredients'
import { NO_SAVED_HINT } from './recipeFilter'
import { filterOptions, recipeFilterCount } from './Recipes'
import type { RowControls } from './RecipeRows'
import { RecipeRows } from './RecipeRows'
import { OriginalDetails } from './RowDetails'
import { HeaderRow } from './Section'
import { copyLines, newCopy } from '../../utils/balance/copies'

export const EXPLORE_ID = 'explore'
export const CLOSE_EXPLORE = 'Close Explore'

/** What Explore's rows share with the Recipes rows: picks. */
export type ExploreRowControls = Pick<
  RowControls,
  'pickedIds' | 'onTogglePicked'
>

/** What Explore needs from the page. */
export interface ExploreProps {
  readonly ingredients: IngredientsState
  readonly rows: ExploreRowControls
  /** null when signed out: no hearts */
  readonly saved: SavedState | null
  readonly savedOnly: boolean
  readonly onSaved: (on: boolean) => void
}

/** The ingredient ids of a library original, for Explore's filter (#182, answer 37). */
export const originalIds = (recipe: LibraryRecipe): ReadonlySet<string> =>
  new Set(recipe.ingredients.map((ri) => ri.ingredientId))

/** Every ingredient Explore's recipes use, for the filter's pickers. */
export const exploreOptions = (recipes: readonly LibraryRecipe[] = library) =>
  filterOptions(
    recipes.flatMap((recipe) =>
      copyLines(recipe, newCopy(recipe.id), DEFAULT_SOURCE.ingredients)
    )
  )

const GROUP_HEADING =
  'm-0 mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary'

const RESULT =
  'flex min-h-[44px] w-full flex-col items-start rounded-control bg-bg px-3 py-1 text-left text-text shadow-raised data-[pressed]:shadow-pressed data-[focus-visible]:focus-ring'

/** An ingredient result: adds it as an extra, or opens its chip when it is on the list. */
const IngredientResult: FC<{
  item: LibraryIngredient
  ingredients: IngredientsState
}> = ({ item, ingredients }) => {
  const onList = ingredients.list.hasChip(item.id)
  const name = capitaliseFirst(item.name)
  return (
    <li className="flex flex-col gap-1">
      <Button
        onPress={() => ingredients.pick(item)}
        aria-label={onList ? `${name}, on your list` : `Add ${item.name}`}
        className={RESULT}
      >
        <span className="font-semibold">
          {onList ? `✓ ${name}` : `+ ${name}`}
        </span>
        <span className="text-xs text-text-secondary">
          {categoryLabel(placeInShop(item.category).section)}
          {onList ? ' · on your list' : ''}
        </span>
      </Button>
      <AllergenTags allergens={item.allergens} />
    </li>
  )
}

const IngredientGroup: FC<{
  title: string
  items: readonly LibraryIngredient[]
  ingredients: IngredientsState
}> = ({ title, items, ingredients }) => (
  <div>
    <h3 className={GROUP_HEADING}>{title}</h3>
    <ul className="m-0 flex list-none flex-col gap-2 p-1">
      {items.map((item) => (
        <IngredientResult
          key={item.id}
          item={item}
          ingredients={ingredients}
        />
      ))}
    </ul>
  </div>
)

const RecipeGroup: FC<{
  title: string
  recipes: readonly LibraryRecipe[]
  controls: RowControls
  saved: SavedState | null
}> = ({ title, recipes, controls, saved }) => (
  <div>
    <h3 className={GROUP_HEADING}>{title}</h3>
    <RecipeRows
      rows={recipes.map((recipe) => ({
        recipe,
        details: (name) => (
          <OriginalDetails
            recipe={recipe}
            title={name}
            saved={saved}
          />
        )
      }))}
      controls={controls}
    />
  </div>
)

/** Ingredients and recipes; side by side (ingredients left) once Explore is 768px wide. */
const Groups: FC<{
  ingredients: readonly LibraryIngredient[]
  recipes: readonly LibraryRecipe[]
  props: ExploreProps
  controls: RowControls
}> = ({ ingredients, recipes, props, controls }) => (
  <div className="@container">
    <div className="grid grid-cols-1 gap-4 @[768px]:grid-cols-2">
      {ingredients.length > 0 && (
        <IngredientGroup
          title="Ingredients"
          items={ingredients}
          ingredients={props.ingredients}
        />
      )}
      {recipes.length > 0 && (
        <RecipeGroup
          title="Recipes"
          recipes={recipes}
          controls={controls}
          saved={props.saved}
        />
      )}
    </div>
  </div>
)

/** Browse, ranked matches, or "No matches" with close matches and then browse. */
const Results: FC<{
  query: string
  results: ExploreResults
  props: ExploreProps
  controls: RowControls
}> = ({ query, results, props, controls }) => {
  if (results.kind === 'matches')
    return (
      <Groups
        ingredients={results.ingredients}
        recipes={results.recipes}
        props={props}
        controls={controls}
      />
    )
  const browse = (
    <RecipeGroup
      title="Browse recipes"
      recipes={results.kind === 'browse' ? results.recipes : results.browse}
      controls={controls}
      saved={props.saved}
    />
  )
  if (results.kind === 'browse') return browse
  const close = results.ingredients.length + results.recipes.length > 0
  return (
    <div className="flex flex-col gap-4">
      <p
        role="status"
        className="m-0 font-semibold text-text"
      >
        No matches for &lsquo;{query.trim()}&rsquo;
      </p>
      {close && (
        <div>
          <h3 className={GROUP_HEADING}>Close matches</h3>
          <Groups
            ingredients={results.ingredients}
            recipes={results.recipes}
            props={props}
            controls={controls}
          />
        </div>
      )}
      {browse}
    </div>
  )
}

const FILTER_ID = `${EXPLORE_ID}-filter`

/** The savedIds Explore filters by: the server's, or none signed out. */
export const savedIdsOf = (saved: SavedState | null): ReadonlySet<string> =>
  saved === null ? new Set() : saved.ids

/**
 * The filter (#182: Saved, contains, excludes on the originals), then the Saved hint when
 * Saved is on but nothing is hearted, or the results.
 */
const ExploreBody: FC<{ props: ExploreProps }> = ({ props }) => {
  const { query } = useExplore()
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(props.savedOnly)
  const [picked, setPicked] =
    useState<Pick<RecipeFilter, 'contains' | 'excludes'>>(NO_RECIPE_FILTER)
  const filter: RecipeFilter = { ...picked, savedOnly: props.savedOnly }
  const savedIds = savedIdsOf(props.saved)
  const source: ExploreSource = {
    ...DEFAULT_SOURCE,
    recipes: DEFAULT_SOURCE.recipes.filter((recipe) =>
      recipeMatches(originalIds(recipe), filter)
    ),
    savedOnly: props.savedOnly,
    savedIds
  }
  const hidden = DEFAULT_SOURCE.recipes.length - shownRecipes(source).length
  const controls: RowControls = {
    ...props.rows,
    openIds,
    onToggleOpen: (id) =>
      setOpenIds(
        (ids) =>
          new Set(ids.has(id) ? [...ids].filter((x) => x !== id) : [...ids, id])
      ),
    seeRecipe: true
  }
  return (
    <div className="flex flex-col gap-4">
      <ActionsRow label="Explore actions">
        <FilterButton
          panelId={FILTER_ID}
          open={filterOpen}
          active={recipeFilterCount(filter)}
          onPress={() => setFilterOpen(!filterOpen)}
        />
      </ActionsRow>
      <RecipeFilterPanel
        id={FILTER_ID}
        open={filterOpen}
        label="Filter Explore"
        options={exploreOptions()}
        saved={true}
        filter={filter}
        onChange={(next) => {
          setPicked({ contains: next.contains, excludes: next.excludes })
          if (next.savedOnly !== props.savedOnly) props.onSaved(next.savedOnly)
        }}
      />
      {recipeFilterOn(filter) && (
        <HiddenNote
          hidden={hidden}
          onClear={() => {
            setPicked(NO_RECIPE_FILTER)
            props.onSaved(false)
          }}
        />
      )}
      {props.savedOnly && savedIds.size === 0 ? (
        <p
          className="m-0 text-text-secondary"
          role="status"
        >
          {NO_SAVED_HINT}
        </p>
      ) : (
        <Results
          query={query}
          results={exploreResults(query, source)}
          props={props}
          controls={controls}
        />
      )}
    </div>
  )
}

const CLOSE_BUTTON =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-bg text-lg font-bold text-text shadow-raised data-[pressed]:shadow-pressed data-[focus-visible]:focus-ring'

/**
 * Explore (#181): an inline, labelled region with a neumorphic outline that pushes content
 * down (never an overlay). Clicking outside and Escape leave it open; only its X closes it.
 * The header row collapses it.
 */
export const Explore: FC<ExploreProps> = (props) => {
  const explore = useExplore()
  return (
    <section
      id={EXPLORE_ID}
      aria-labelledby={`${EXPLORE_ID}-heading-title`}
      className="flex min-w-0 flex-col gap-3 rounded-card bg-bg p-3 shadow-raised"
    >
      <div className="flex items-center gap-2">
        <HeaderRow
          headingId={`${EXPLORE_ID}-heading`}
          title="Explore"
          summary=""
          toggle={{
            open: !explore.collapsed,
            onToggle: explore.toggleCollapsed,
            controls: `${EXPLORE_ID}-content`
          }}
        />
        <Button
          aria-label={CLOSE_EXPLORE}
          onPress={explore.close}
          className={CLOSE_BUTTON}
        >
          <span aria-hidden="true">✕</span>
        </Button>
      </div>
      <Collapse
        id={`${EXPLORE_ID}-content`}
        open={!explore.collapsed}
      >
        <ExploreBody props={props} />
      </Collapse>
    </section>
  )
}

const RAIL_BUTTON =
  'inline-flex h-11 w-11 items-center justify-center rounded-pill bg-bg text-text shadow-raised data-[pressed]:shadow-pressed data-[focus-visible]:focus-ring'

/**
 * From 992px Explore is a push drawer column on the right (#181): it squeezes the layout and
 * never covers it, and the search bar lives in it. Closed, it is a narrow strip with a search
 * button that reopens it and puts focus in the search box.
 */
export const ExploreDrawer: FC<ExploreProps & { open: boolean }> = ({
  open,
  ...props
}) => {
  const explore = useExplore()
  return (
    <aside
      aria-label="Explore drawer"
      data-open={open}
      className={`sticky top-0 flex max-h-screen shrink-0 flex-col gap-3 self-start overflow-y-auto pb-6 pt-4 transition-[width] duration-200 ease-out motion-reduce:duration-0 motion-reduce:transition-none ${
        open ? 'w-[360px]' : 'w-14'
      }`}
    >
      {open ? (
        <>
          <SearchBox />
          <Explore {...props} />
        </>
      ) : (
        <Button
          aria-label={SEARCH_LABEL}
          onPress={() => {
            explore.show()
            explore.requestFocus()
          }}
          className={RAIL_BUTTON}
        >
          <IngreIconSearch />
        </Button>
      )}
    </aside>
  )
}
