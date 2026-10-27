import { translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import { splitTitle } from '../../components/recipeTitle'
import type { CopyLine, RecipeCopy } from '../../utils/balance/copies'
import { usedLines } from '../../utils/balance/copies'
import type { CopyEntry } from '../../utils/chips/chips'
import { rowChips } from '../../utils/chips/chips'
import type { ChipsState } from '../../utils/chips/useChips'
import type { RecipeFilter } from '../../utils/filters/filters'
import {
  NO_RECIPE_FILTER,
  recipeFilterOn,
  recipeMatches
} from '../../utils/filters/filters'
import type { SavedState } from '../../utils/saved/useSaved'
import { Button } from 'react-aria-components'
import {
  ACTION_BUTTON,
  ActionsRow,
  FilterButton,
  HiddenNote,
  RecipeFilterPanel
} from './Filters'
import type { FilterOption } from './Filters'
import { recipeCount } from './recipeFilter'
import { RecipeRows } from './RecipeRows'
import { CopyDetails } from './RowDetails'
import { Section } from './Section'

export const NO_PICKS_HINT = translate('recipes.empty')

/** A set with one id added, or removed when it is already there. */
export const toggled = (
  ids: ReadonlySet<string>,
  id: string
): ReadonlySet<string> =>
  new Set(ids.has(id) ? [...ids].filter((x) => x !== id) : [...ids, id])

/** The ingredients a recipe filter can name, from these lines, by name. */
export const filterOptions = (lines: readonly CopyLine[]): FilterOption[] =>
  [...new Map(lines.map((line) => [line.ingredientId, line.name]))]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

/** The ids a copy uses now, for contains and excludes (#182, answer 37). */
export const usedIds = (entry: Pick<CopyEntry, 'lines'>): ReadonlySet<string> =>
  new Set(usedLines(entry.lines).map((line) => line.ingredientId))

/** Count of chosen filter values, for the Filter button. */
export const recipeFilterCount = (filter: RecipeFilter): number =>
  filter.contains.length + filter.excludes.length + (filter.savedOnly ? 1 : 0)

/** The undo notice for a dismissed copy, or null when that recipe was not picked. */
export const removalNotice = (
  copy: RecipeCopy | null,
  name: string
): { copy: RecipeCopy; title: string } | null =>
  copy === null ? null : { copy, title: splitTitle(name).title }

const FILTER_ID = 'recipes-filter'

/** The Recipes section (#181, #182, #192): the picked copies as rows, with a filter. */
export const Recipes: FC<{
  list: ChipsState
  saved: SavedState | null
  onFind: () => void
}> = ({ list, saved, onFind }) => {
  const t = useT()
  const [undo, setUndo] = useState<{
    copy: RecipeCopy
    title: string
  } | null>(null)
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<RecipeFilter>(NO_RECIPE_FILTER)
  const shown = list.entries.filter((entry) =>
    recipeMatches(usedIds(entry), filter)
  )
  const remove = (recipe: { id: string; name: string }) => {
    setUndo(removalNotice(list.dismissPicked(recipe.id), recipe.name))
  }
  return (
    <Section
      id="recipes"
      title={t('recipes.title')}
      raised
      summary={t('recipes.picked', {
        recipes: recipeCount(list.entries.length)
      })}
      action={
        <Button
          onPress={onFind}
          className={ACTION_BUTTON}
        >
          {t('recipes.find')}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <ActionsRow label={t('recipes.actions')}>
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
          label={t('recipes.filter')}
          options={filterOptions(list.entries.flatMap((e) => e.lines))}
          saved={false}
          filter={filter}
          onChange={setFilter}
        />
        {list.entries.length === 0 && (
          <p className="m-0 text-text-secondary">{NO_PICKS_HINT}</p>
        )}
        {undo !== null && (
          <p
            role="status"
            className="m-0 flex flex-wrap items-center gap-3 text-text"
          >
            <span>{t('recipes.removed', { title: undo.title })}</span>
            <Button
              onPress={() => {
                list.restoreCopy(undo.copy)
                setUndo(null)
              }}
              className={ACTION_BUTTON}
            >
              {t('recipes.undo')}
            </Button>
          </p>
        )}
        {recipeFilterOn(filter) && (
          <HiddenNote
            hidden={list.entries.length - shown.length}
            onClear={() => setFilter(NO_RECIPE_FILTER)}
          />
        )}
        <RecipeRows
          rows={shown.map((entry) => ({
            recipe: entry.recipe,
            lines: usedLines(entry.lines),
            details: (title) => (
              <CopyDetails
                entry={entry}
                title={title}
                list={list}
                saved={saved}
                chips={rowChips(entry, list.chipState)}
              />
            )
          }))}
          controls={{
            pickedIds: list.pickedIds,
            onTogglePicked: list.togglePicked,
            openIds,
            onToggleOpen: (id) => setOpenIds((ids) => toggled(ids, id)),
            seeRecipe: false,
            recessed: true,
            snap: true,
            onRemove: remove
          }}
        />
      </div>
    </Section>
  )
}
