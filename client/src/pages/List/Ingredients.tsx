import type { FC } from 'react'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { focusById } from '../../utils/focus'
import type { Chip } from '../../utils/chips/chips'
import { groupChips } from '../../utils/chips/chips'
import type { ChipsState } from '../../utils/chips/useChips'
import type { ChipFilter } from '../../utils/filters/filters'
import {
  INGREDIENT_STATUSES,
  NO_CHIP_FILTER,
  chipFilterOn,
  chipMatches
} from '../../utils/filters/filters'
import type { ChipView } from './Chips'
import { ChipGroups } from './Chips'
import type { SourceActions } from './ChipDetails'
import {
  CategoryField,
  ChipAllergens,
  RemoveQuestion,
  SourceFields,
  TotalLine
} from './ChipDetails'
import type { ChipScope } from './chipText'
import {
  INGREDIENTS_SCOPE,
  chipAmount,
  chipCategoryId,
  chipChevronId,
  sourceFieldId
} from './chipText'
import {
  ACTION_BUTTON,
  ActionsRow,
  ChipFilterPanel,
  FilterButton,
  HiddenNote
} from './Filters'
import { PLUS_ID } from './PlusArea'
import { Section } from './Section'
import type { FocusTarget } from './usePanel'
import { useFocusAfterRender, usePanel } from './usePanel'

export const INGREDIENTS_ID = 'ingredients'
export const INGREDIENTS_HEADING_ID = `${INGREDIENTS_ID}-heading`

/** Shown when there are no chips yet. */
export const NO_CHIPS_HINT =
  'Nothing on your list yet. Tick recipes in Explore, or add an ingredient with the plus in Extra.'

/** The question before Refresh (#182, answer 35). */
export const REFRESH_QUESTION =
  'Reset every recipe to its original ingredients and 2 portions?'

/** "5 items, 2 crossed off" */
export const ingredientsSummary = (
  chips: readonly { crossed: boolean }[]
): string => {
  const crossed = chips.filter((chip) => chip.crossed).length
  const items = `${chips.length} ${chips.length === 1 ? 'item' : 'items'}`
  return crossed === 0 ? items : `${items}, ${crossed} crossed off`
}

/** Count of ticked filter values, for the Filter button. */
export const chipFilterCount = (filter: ChipFilter): number =>
  filter.sections.size + filter.statuses.size

/**
 * What a chip's boxes do (#182): recipe boxes change that recipe's copy, the Extra box the
 * shared Extra amount. After a removal focus goes to the box, or on when it has gone.
 */
export const sourceActions = (
  list: ChipsState,
  chip: Chip,
  scope: ChipScope,
  focusAfterRender: (target: FocusTarget) => void
): SourceActions => ({
  onAmount: (source, value) => {
    if (source.kind === 'extra') list.setExtra(chip.id, Math.round(value))
    else list.setAmount(source.recipeId, chip.id, value)
  },
  onRemove: (source) => {
    if (source.kind === 'extra') {
      list.removeExtra(chip.id)
      focusAfterRender({
        kind: 'first',
        ids: [chipChevronId(chip.id, scope), chipChevronId(chip.id), PLUS_ID]
      })
      return
    }
    list.setAmount(source.recipeId, chip.id, 0)
    focusAfterRender({
      kind: 'first',
      ids: [sourceFieldId(chip.id, source.recipeId, scope)]
    })
  }
})

/**
 * Everything the Ingredients section shares with Extra and Explore (#181, #182): the open
 * chip panel, the section's open state, and picking a catalogue item (from the plus or an
 * Explore result). It goes into Extra at 1; one already on the list is scrolled to and opened.
 */
export const useIngredients = (list: ChipsState) => {
  const { panel, show, close } = usePanel()
  const [open, setOpen] = useState(true)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<ChipFilter>(NO_CHIP_FILTER)
  const focusAfterRender = useFocusAfterRender()
  const pick = (item: LibraryIngredient): boolean => {
    const onList = list.hasChip(item.id)
    list.addExtra(item)
    if (onList) {
      setOpen(true)
      setFilter(NO_CHIP_FILTER)
      show(item.id)
      focusAfterRender({ kind: 'reveal', id: chipChevronId(item.id) })
      return true
    }
    setMessage(`${capitaliseFirst(item.name)} added to Extra`)
    return false
  }
  return {
    list,
    panel,
    close,
    open,
    toggle: () => setOpen(!open),
    message,
    setMessage,
    filter,
    setFilter,
    focusAfterRender,
    pick
  }
}

export type IngredientsState = ReturnType<typeof useIngredients>

/** The view shared by Ingredients and Extra chips: the same panel everywhere (#182). */
export const chipView = (
  state: IngredientsState,
  scope: ChipScope,
  panel: ChipView['panel'],
  amountOf: (chip: Chip) => string
): ChipView => {
  const { list, focusAfterRender } = state
  return {
    scope,
    amountOf,
    onToggle: list.toggleCrossed,
    panel,
    details: (chip) => (
      <>
        <div className="flex flex-col gap-2">
          <h4 className="m-0 text-sm font-semibold">Used in</h4>
          <SourceFields
            chip={chip}
            scope={scope}
            actions={sourceActions(list, chip, scope, focusAfterRender)}
          />
        </div>
        <TotalLine chip={chip} />
        <ChipAllergens chip={chip} />
        <CategoryField
          chip={chip}
          scope={scope}
          onCategory={list.setCategory}
          onSortNow={(id) => {
            list.sort()
            focusAfterRender({ kind: 'checked', id: chipCategoryId(id, scope) })
          }}
        />
      </>
    )
  }
}

/** Refresh (#182): an inline question, then every copy goes back to its original. */
const RefreshQuestion: FC<{ onYes: () => void; onDone: () => void }> = ({
  onYes,
  onDone
}) => (
  <RemoveQuestion
    yesId="refresh-yes"
    question={REFRESH_QUESTION}
    onYes={() => {
      onYes()
      onDone()
    }}
    onNo={onDone}
  />
)

const FILTER_ID = `${INGREDIENTS_ID}-filter`
export const REFRESH_ID = 'refresh'

/** The Ingredients section (#179, #182): actions, filter, and the chips by category. */
export const Ingredients: FC<{
  state: IngredientsState
  collapsible: boolean
}> = ({ state, collapsible }) => {
  const { list, filter, setFilter } = state
  const [filterOpen, setFilterOpen] = useState(false)
  const [asking, setAsking] = useState(false)
  const shown = list.chips.filter((chip) => chipMatches(chip, filter))
  const view = chipView(state, INGREDIENTS_SCOPE, state.panel, chipAmount)
  return (
    <Section
      id={INGREDIENTS_ID}
      title="Ingredients"
      collapsible={collapsible}
      open={state.open}
      onToggle={state.toggle}
      summary={ingredientsSummary(list.chips)}
    >
      <div className="flex flex-col gap-4">
        <ActionsRow label="Ingredients actions">
          <FilterButton
            panelId={FILTER_ID}
            open={filterOpen}
            active={chipFilterCount(filter)}
            onPress={() => setFilterOpen(!filterOpen)}
          />
          <Button
            onPress={list.sort}
            className={ACTION_BUTTON}
          >
            Sort
          </Button>
          <Button
            id={REFRESH_ID}
            onPress={() => setAsking(true)}
            className={ACTION_BUTTON}
          >
            Refresh
          </Button>
        </ActionsRow>
        {asking && (
          <RefreshQuestion
            onYes={list.refresh}
            onDone={() => {
              setAsking(false)
              focusById(REFRESH_ID)
            }}
          />
        )}
        <ChipFilterPanel
          id={FILTER_ID}
          open={filterOpen}
          label="Filter ingredients"
          statuses={INGREDIENT_STATUSES}
          filter={filter}
          onChange={setFilter}
        />
        {list.chips.length === 0 && (
          <p className="m-0 text-text-secondary">{NO_CHIPS_HINT}</p>
        )}
        {chipFilterOn(filter) && (
          <HiddenNote
            hidden={list.chips.length - shown.length}
            onClear={() => setFilter(NO_CHIP_FILTER)}
          />
        )}
        <ChipGroups
          groups={groupChips(shown)}
          view={view}
        />
      </div>
    </Section>
  )
}
