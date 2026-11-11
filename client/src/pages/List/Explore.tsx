import { useT } from '../../i18n'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { Button, ToggleButton } from '../../lib/aria'
import { AllergenTags } from '../../components/AllergenTags'
import { splitTitle } from '../../components/recipeTitle'
import { SearchBox } from '../../components/SearchBox/SearchBox'
import { Sheet } from '../../components/Sheet'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import {
  EDGE_TONE_CLASSES,
  TONE_CLASSES
} from '../../components/SectionTone/badgeTone'
import type { CopyEntry } from '../../utils/chips/chips'
import type { RecipeCopy } from '../../utils/balance/copies'
import { useSearchedEvent } from '../../utils/analytics/useSearchedEvent'
import { useExplore } from '../../utils/explore/ExploreContext'
import { flaggedIds, showsSuggestions } from '../../utils/guidance/guidance'
import type { ExploreResults } from '../../utils/explore/exploreSearch'
import { DEFAULT_SOURCE } from '../../utils/explore/exploreSearch'
import type { ExploreSection } from '../../utils/explore/sections'
import {
  SECTION_ACCENT,
  SECTION_TONE,
  exploreSectionOf,
  inSections,
  sectionsOf
} from '../../utils/explore/sections'
import type { RecipeFilter } from '../../utils/filters/filters'
import { NO_RECIPE_FILTER, recipeFilterOn } from '../../utils/filters/filters'
import { library } from '../../utils/library/recipeLibrary'
import type { Personal } from '../../utils/profile/personal'
import type { SavedState } from '../../utils/saved/useSaved'
import {
  ActionsRow,
  FilterButton,
  HiddenNote,
  RecipeFilterPanel
} from './Filters'
import { GuestFlag } from './GuestFlag'
import { GuestsButton, GuestsPanel } from './Guests'
import { GuidanceDial } from './GuidanceDial'
import { IngredientPicture } from '../../components/IngredientPicture'
import { IngredientDetails } from './IngredientJourney'
import type { IngredientsState } from './Ingredients'
import { noSavedHint } from './recipeFilter'
import { filterOptions, recipeFilterCount } from './Recipes'
import type { RowControls } from './RecipeRows'
import { RecipeRows } from './RecipeRows'
import { OriginalDetails } from './RowDetails'
import { computeExploreData } from '../../hooks/useExploreResults'
import { copyLines, newCopy, usedLines } from '../../utils/balance/copies'
import { catalogue } from '../../utils/library/recipeLibrary'
import { bundledSuggestions } from '../../utils/suggest/suggest'
import type { Suggestion } from '../../utils/suggest/suggest'
import {
  BrowseIngredients,
  SuggestionNote,
  UseToggle,
  UsingBar
} from './Suggestions'

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
  /** behaviour, settings and locks (#224): browse order, and recipes never shown */
  readonly personal: Personal
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
  'flex min-h-[44px] w-full flex-col items-start rounded-control border-l-4 bg-bg px-3 py-1 text-left text-text shadow-raised data-[pressed]:shadow-pressed data-[focus-visible]:focus-ring'

/** An ingredient result: adds it to Extra (#192: the sheet stays open and says so). */
const IngredientResult: FC<{
  item: LibraryIngredient
  ingredients: IngredientsState
  controls: RowControls
}> = ({ item, ingredients, controls }) => {
  const t = useT()
  const { guidance } = useExplore()
  const onList = ingredients.list.hasChip(item.id)
  const section = exploreSectionOf(item)
  const category = t(`exploreSection.${section}`)
  console.log('[IngredientResult] render', {
    id: item.id,
    name: item.name,
    onList,
    section
  })
  return (
    <li className="flex flex-col gap-1">
      <Button
        data-section={section}
        onPress={() => ingredients.add(item)}
        aria-label={
          onList
            ? t('explore.onListLabel', { name: capitaliseFirst(item.name) })
            : t('explore.add', { name: item.name })
        }
        className={`${RESULT} ${SECTION_ACCENT[section]}`}
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <IngredientPicture id={item.id} />
          {onList
            ? t('explore.onListName', { name: capitaliseFirst(item.name) })
            : t('explore.add', { name: item.name })}
        </span>
      </Button>
      <span className="px-3 text-xs text-text-secondary">
        {onList ? t('explore.categoryOnList', { category }) : category}
      </span>
      {showsSuggestions(guidance) && <UseToggle item={item} />}
      <AllergenTags allergens={item.allergens} />
      <GuestFlag tags={item.allergens} />
      <IngredientDetails
        item={item}
        controls={controls}
      />
    </li>
  )
}

/** One section's toggle: filled in its colour when on, outlined when off. */
const SectionToggle: FC<{
  section: ExploreSection
  on: boolean
  onChange: () => void
}> = ({ section, on, onChange }) => {
  const t = useT()
  const tone = SECTION_TONE[section]
  return (
    <ToggleButton
      isSelected={on}
      onChange={onChange}
      className={`inline-flex min-h-[44px] items-center rounded-pill border-2 px-3 text-sm font-semibold data-[focus-visible]:focus-ring ${
        on ? TONE_CLASSES[tone] : EDGE_TONE_CLASSES[tone]
      }`}
    >
      {t(`exploreSection.${section}`)}
    </ToggleButton>
  )
}

/** The sections the results fall in, to narrow them to; shown when there is more than one. */
const SectionFilter: FC<{
  sections: readonly ExploreSection[]
  chosen: ReadonlySet<ExploreSection>
  onToggle: (section: ExploreSection) => void
}> = ({ sections, chosen, onToggle }) => {
  const t = useT()
  return (
    sections.length > 1 && (
      <div
        role="group"
        aria-label={t('explore.sectionFilter')}
        className="mb-2 flex flex-wrap gap-2"
      >
        {sections.map((section) => (
          <SectionToggle
            key={section}
            section={section}
            on={chosen.has(section)}
            onChange={() => onToggle(section)}
          />
        ))}
      </div>
    )
  )
}

const toggled = (
  chosen: ReadonlySet<ExploreSection>,
  section: ExploreSection
): Set<ExploreSection> =>
  chosen.has(section)
    ? new Set([...chosen].filter((s) => s !== section))
    : new Set([...chosen, section])

const IngredientGroup: FC<{
  title: string
  items: readonly LibraryIngredient[]
  ingredients: IngredientsState
  controls: RowControls
}> = ({ title, items, ingredients, controls }) => {
  const [chosen, setChosen] = useState<ReadonlySet<ExploreSection>>(new Set())
  return (
    <div>
      <h3 className={GROUP_HEADING}>{title}</h3>
      <SectionFilter
        sections={sectionsOf(items)}
        chosen={chosen}
        onToggle={(section) => setChosen((now) => toggled(now, section))}
      />
      <ul className="m-0 flex list-none flex-col gap-2 p-1">
        {inSections(items, chosen).map((item) => (
          <IngredientResult
            key={item.id}
            item={item}
            ingredients={ingredients}
            controls={controls}
          />
        ))}
      </ul>
    </div>
  )
}

/** The list's copy of a recipe, or null when it is not on the list. */
export const listCopyOf = (
  entries: readonly CopyEntry[],
  recipeId: string
): RecipeCopy | null =>
  entries.find((entry) => entry.recipe.id === recipeId)?.copy ?? null

/** What a suggestion adds to its row: a note, and the ingredients to outline (#204, #206). */
interface Annotation {
  readonly note: ReactNode
  readonly flagged: ReadonlySet<string>
}

const NO_NOTES: ReadonlyMap<string, Annotation> = new Map()

/** A row's note and outlines when it has them: nothing is passed for a row without (exactOptionalPropertyTypes). */
const noteFor = (
  notes: ReadonlyMap<string, Annotation>,
  recipeId: string
): { note?: ReactNode; flagged?: ReadonlySet<string> } =>
  notes.get(recipeId) ?? {}

const RecipeGroup: FC<{
  title: string
  recipes: readonly LibraryRecipe[]
  controls: RowControls
  saved: SavedState | null
  /** the copies on the list: saving a listed recipe saves its customisations (#182) */
  entries: readonly CopyEntry[]
  /** a note and outlines for some rows, by recipe id (#204) */
  notes?: ReadonlyMap<string, Annotation>
}> = ({ title, recipes, controls, saved, entries, notes = NO_NOTES }) => (
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
        ),
        ...noteFor(notes, recipe.id)
      }))}
      controls={controls}
    />
  </div>
)

/**
 * The ingredient-first loop (#204): the ingredients being cooked with, then up to three
 * recipes that use them, each with what is missing, the extra cost and one "Add to list"
 * button. Recipe content stays closed until "See recipe". Nothing shows until one is selected.
 */
const SuggestionsSection: FC<{
  props: ExploreProps
  controls: RowControls
}> = ({ props, controls }) => {
  const t = useT()
  const { selected, guidance } = useExplore()
  const [ack, setAck] = useState('')
  const suggestions = bundledSuggestions(selected)
  const using = catalogue.filter((item) => selected.has(item.id))
  const add = (suggestion: Suggestion) => {
    controls.onTogglePicked(suggestion.recipe)
    setAck(
      t('suggest.added', { title: splitTitle(suggestion.recipe.name).title })
    )
  }
  const notes = new Map(
    suggestions.map((suggestion) => [
      suggestion.recipe.id,
      {
        note: (
          <SuggestionNote
            key={suggestion.recipe.id}
            suggestion={suggestion}
            title={splitTitle(suggestion.recipe.name).title}
            picked={controls.pickedIds.has(suggestion.recipe.id)}
            onAdd={() => add(suggestion)}
            primary={guidance === 'hand-held'}
          />
        ),
        flagged: flaggedIds(suggestion.missing, guidance)
      }
    ])
  )
  return (
    <section
      aria-label={t('suggest.title')}
      className="flex flex-col gap-3"
    >
      <UsingBar items={using} />
      <p
        role="status"
        className="m-0 text-sm font-semibold text-success"
      >
        {ack}
      </p>
      {suggestions.length === 0 ? (
        <p className="m-0 text-text-secondary">{t('suggest.none')}</p>
      ) : (
        <RecipeGroup
          title={t('suggest.title')}
          recipes={suggestions.map((suggestion) => suggestion.recipe)}
          controls={controls}
          saved={props.saved}
          entries={props.ingredients.list.entries}
          notes={notes}
        />
      )}
    </section>
  )
}

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
            controls={controls}
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
const GUESTS_ID = `${EXPLORE_ID}-guests`

/** How many ingredients and recipes matched; a "no matches" screen counts as none (#222). */
export const matchCounts = (
  results: ExploreResults
): { ingredients: number; recipes: number } =>
  results.kind === 'matches'
    ? {
        ingredients: results.ingredients.length,
        recipes: results.recipes.length
      }
    : { ingredients: 0, recipes: 0 }

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
  const { selected, guidance } = useExplore()
  const proactive = showsSuggestions(guidance)
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(props.savedOnly)
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [picked, setPicked] =
    useState<Pick<RecipeFilter, 'contains' | 'excludes'>>(NO_RECIPE_FILTER)
  const filter: RecipeFilter = { ...picked, savedOnly: props.savedOnly }
  const { results, hidden, counts } = computeExploreData(
    query,
    { savedOnly: props.savedOnly, personal: props.personal },
    filter,
    props.saved
  )
  useSearchedEvent(query, counts)
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
    namesScroll: false,
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
        <GuestsButton
          panelId={GUESTS_ID}
          open={guestsOpen}
          onPress={() => setGuestsOpen(!guestsOpen)}
        />
      </ActionsRow>
      <GuestsPanel
        id={GUESTS_ID}
        open={guestsOpen}
      />
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
      <GuidanceDial />
      {query.trim() === '' && proactive && <BrowseIngredients />}
      {selected.size > 0 && proactive && (
        <SuggestionsSection
          props={props}
          controls={controls}
        />
      )}
      {props.savedOnly && (props.saved?.ids.size ?? 0) === 0 ? (
        <p
          className="m-0 text-text-secondary"
          role="status"
        >
          {noSavedHint()}
        </p>
      ) : (
        <Results
          query={query}
          results={results}
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
