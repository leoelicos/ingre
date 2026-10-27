import { useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import { AllergenTags } from '../../components/AllergenTags'
import { SearchBox } from '../../components/SearchBox/SearchBox'
import { Sheet } from '../../components/Sheet'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import type { CopyEntry } from '../../utils/chips/chips'
import { categoryLabel } from '../../utils/chips/chips'
import type { RecipeCopy } from '../../utils/balance/copies'
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
import { copyLines, newCopy, usedLines } from '../../utils/balance/copies'

export const EXPLORE_ID = 'explore'

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

/** An ingredient result: adds it to Extra (#192: the sheet stays open and says so). */
const IngredientResult: FC<{
  item: LibraryIngredient
  ingredients: IngredientsState
}> = ({ item, ingredients }) => {
  const t = useT()
  const onList = ingredients.list.hasChip(item.id)
  const name = capitaliseFirst(item.name)
  const category = categoryLabel(placeInShop(item.category).section)
  return (
    <li className="flex flex-col gap-1">
      <Button
        onPress={() => ingredients.add(item)}
        aria-label={
          onList
            ? t('explore.onListLabel', { name })
            : t('explore.add', { name: item.name })
        }
        className={RESULT}
      >
        <span className="font-semibold">
          {t(onList ? 'explore.onListName' : 'explore.addName', { name })}
        </span>
        <span className="text-xs text-text-secondary">
          {onList ? t('explore.categoryOnList', { category }) : category}
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

/** The list's copy of a recipe, or null when it is not on the list. */
export const listCopyOf = (
  entries: readonly CopyEntry[],
  recipeId: string
): RecipeCopy | null =>
  entries.find((entry) => entry.recipe.id === recipeId)?.copy ?? null

const RecipeGroup: FC<{
  title: string
  recipes: readonly LibraryRecipe[]
  controls: RowControls
  saved: SavedState | null
  /** the copies on the list: saving a listed recipe saves its customisations (#182) */
  entries: readonly CopyEntry[]
}> = ({ title, recipes, controls, saved, entries }) => (
  <div>
    <h3 className={GROUP_HEADING}>{title}</h3>
    <RecipeRows
      rows={recipes.map((recipe) => ({
        recipe,
        lines: usedLines(
          copyLines(recipe, newCopy(recipe.id), DEFAULT_SOURCE.ingredients)
        ),
        details: (name) => (
          <OriginalDetails
            recipe={recipe}
            title={name}
            saved={saved}
            listCopy={listCopyOf(entries, recipe.id)}
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
}> = ({ ingredients, recipes, props, controls }) => {
  const t = useT()
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-4 @[768px]:grid-cols-2">
        {ingredients.length > 0 && (
          <IngredientGroup
            title={t('ingredients.title')}
            items={ingredients}
            ingredients={props.ingredients}
          />
        )}
        {recipes.length > 0 && (
          <RecipeGroup
            title={t('recipes.title')}
            recipes={recipes}
            controls={controls}
            saved={props.saved}
            entries={props.ingredients.list.entries}
          />
        )}
      </div>
    </div>
  )
}

/** Browse, ranked matches, or "No matches" with close matches and then browse. */
const Results: FC<{
  query: string
  results: ExploreResults
  props: ExploreProps
  controls: RowControls
}> = ({ query, results, props, controls }) => {
  const t = useT()
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
      title={t('explore.browse')}
      recipes={results.kind === 'browse' ? results.recipes : results.browse}
      controls={controls}
      saved={props.saved}
      entries={props.ingredients.list.entries}
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
        {t('explore.noMatches', { query: query.trim() })}
      </p>
      {close && (
        <div>
          <h3 className={GROUP_HEADING}>{t('explore.closeMatches')}</h3>
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
export const ExploreBody: FC<{ props: ExploreProps; query: string }> = ({
  props,
  query
}) => {
  const t = useT()
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
    seeRecipe: true,
    recessed: false,
    carousel: false,
    swipe: null
  }
  return (
    <div className="flex flex-col gap-4">
      <ActionsRow label={t('explore.actions')}>
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
        label={t('explore.filter')}
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

export const EXPLORE_SHEET_ID = 'explore-sheet'

/**
 * Explore (#192): discovery off the page, in a bottom sheet on mobile and a centred modal from
 * 576px, opened from "+ Recipe" (or the account menu's Saved link). The search bar sits at the
 * top and has focus when it opens; results and the filter scroll under it.
 */
export const ExploreSheet: FC<
  ExploreProps & {
    isOpen: boolean
    onClose: () => void
    query: string
    onQuery: (query: string) => void
  }
> = ({ isOpen, onClose, query, onQuery, ...props }) => {
  const t = useT()
  return (
    <Sheet
      id={EXPLORE_SHEET_ID}
      title={t('explore.title')}
      isOpen={isOpen}
      onClose={onClose}
      status={props.ingredients.message}
      top={
        <SearchBox
          value={query}
          onChange={onQuery}
        />
      }
    >
      <div
        id={EXPLORE_ID}
        className="p-1.5"
      >
        <ExploreBody
          props={props}
          query={query}
        />
      </div>
    </Sheet>
  )
}
