import { translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import type { CopyLine } from '../../utils/balance/copies'
import { usedLines } from '../../utils/balance/copies'
import type { CopyEntry } from '../../utils/chips/chips'
import { rowChips } from '../../utils/chips/chips'
import type { ChipsState, RemovedCopy } from '../../utils/chips/useChips'
import { CARD_SWIPE, ROW_SWIPE } from '../../utils/gestures/swipe'
import type { SwipeRule } from '../../utils/gestures/swipe'
import { DESKTOP_MIN_WIDTH, useMinWidth } from '../../utils/media/useMinWidth'
import type { LibraryRecipe } from '../../types/library'
import { splitTitle } from '../../components/recipeTitle'
import type { RecipeFilter } from '../../utils/filters/filters'
import {
  NO_RECIPE_FILTER,
  recipeFilterOn,
  recipeMatches
} from '../../utils/filters/filters'
import type { SavedState } from '../../utils/saved/useSaved'
import type { FilterOption } from './Filters'
import {
  ActionsRow,
  FilterButton,
  HiddenNote,
  RecipeFilterPanel
} from './Filters'
import { recipeCount } from './recipeFilter'
import { RecipeRows } from './RecipeRows'
import { CopyDetails } from './RowDetails'
import { Section, headingId } from './Section'
import { SMALL_BUTTON } from './Chips'
import { useFocusAfterRender } from './usePanel'

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

const FILTER_ID = 'recipes-filter'

export const RECIPES_ID = 'recipes'
export const RECIPES_HEADING_ID = headingId(RECIPES_ID)
export const UNDO_ID = 'recipes-undo'

/** Cards swipe up in the mobile row, rows swipe left in the desktop column (#192). */
export const swipeRule = (desktop: boolean): SwipeRule =>
  desktop ? ROW_SWIPE : CARD_SWIPE

/** A recipe swiped off the list, with what Undo needs to put it back. */
export interface Removed {
  readonly title: string
  readonly copy: RemovedCopy
}

/**
 * The note after a swipe (#192): "Removed Pad Thai" with Undo, which puts the recipe back
 * where it was, edits and all, and Dismiss. The status region is always there, so screen
 * readers hear it as it appears.
 */
export const UndoNote: FC<{
  removed: Removed | null
  onUndo: (removed: Removed) => void
  onDismiss: () => void
}> = ({ removed, onUndo, onDismiss }) => {
  const t = useT()
  return (
    <div
      role="status"
      className="contents"
    >
      {removed !== null && (
        <div className="flex flex-wrap items-center gap-3 rounded-card bg-text px-4 py-2 text-inverse-text">
          <span className="flex-1 font-semibold">
            {t('recipes.removed', { title: removed.title })}
          </span>
          <Button
            id={UNDO_ID}
            onPress={() => onUndo(removed)}
            className={SMALL_BUTTON}
          >
            {t('recipes.undo')}
          </Button>
          <Button
            onPress={onDismiss}
            className={SMALL_BUTTON}
          >
            {t('recipes.dismiss')}
          </Button>
        </div>
      )}
    </div>
  )
}

/** Swipe-to-delete with Undo (#192): what was removed, and the actions. */
export const useRemoval = (list: ChipsState) => {
  const [removed, setRemoved] = useState<Removed | null>(null)
  const focusAfterRender = useFocusAfterRender()
  const close = (): void => {
    setRemoved(null)
    focusAfterRender({ kind: 'first', ids: [RECIPES_HEADING_ID] })
  }
  return {
    removed,
    remove: (recipe: LibraryRecipe): void => {
      const copy = list.removePicked(recipe.id)
      if (copy === null) return
      setRemoved({ title: splitTitle(recipe.name).title, copy })
      focusAfterRender({ kind: 'first', ids: [UNDO_ID] })
    },
    undo: (gone: Removed): void => {
      list.restore(gone.copy)
      close()
    },
    dismiss: close
  }
}

/**
 * The Recipes section (#181, #182, #192): the picked copies with a filter. Below 576px a
 * sideways scrolling row of cards (swipe one up to remove it), from 576px a column (swipe a
 * row left); a tap on its tick still unpicks it.
 */
export const Recipes: FC<{
  list: ChipsState
  saved: SavedState | null
}> = ({ list, saved }) => {
  const t = useT()
  const desktop = useMinWidth(DESKTOP_MIN_WIDTH)
  const removal = useRemoval(list)
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<RecipeFilter>(NO_RECIPE_FILTER)
  const shown = list.entries.filter((entry) =>
    recipeMatches(usedIds(entry), filter)
  )
  return (
    <Section
      id={RECIPES_ID}
      title={t('recipes.title')}
      raised
      summary={t('recipes.picked', {
        recipes: recipeCount(list.entries.length)
      })}
    >
      <div className="flex flex-col gap-4">
        <UndoNote
          removed={removal.removed}
          onUndo={removal.undo}
          onDismiss={removal.dismiss}
        />
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
            carousel: true,
            swipe: { rule: swipeRule(desktop), onSwipe: removal.remove }
          }}
        />
      </div>
    </Section>
  )
}
