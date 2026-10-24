import { formatItemCount, translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { groupChips } from '../../utils/chips/chips'
import type { ChipFilter } from '../../utils/filters/filters'
import {
  EXTRA_STATUSES,
  NO_CHIP_FILTER,
  chipFilterOn,
  chipMatches
} from '../../utils/filters/filters'
import type { LibraryIngredient } from '../../types/library'
import { focusById } from '../../utils/focus'
import { ChipGroups } from './Chips'
import { EXTRA_SCOPE, extraAmount } from './chipText'
import {
  ActionsRow,
  ChipFilterPanel,
  FilterButton,
  HiddenNote
} from './Filters'
import type { IngredientsState } from './Ingredients'
import { chipFilterCount, chipView } from './Ingredients'
import { PLUS_ID, PlusArea, PlusButton } from './PlusArea'
import { Section } from './Section'
import { usePanel } from './usePanel'

export const EXTRA_ID = 'extra'

/** Shown when nothing is in Extra (#182, answer 11). */
export const NO_EXTRA_HINT = translate('extra.empty')

/** "3 items" */
export const extraSummary = (n: number): string => formatItemCount(n)

const FILTER_ID = `${EXTRA_ID}-filter`

/**
 * Extra (#182): everything added by hand with the plus, staples included. The same chips as in
 * Ingredients, showing their Extra amount. Collapses only in the vertical layout.
 */
export const Extra: FC<{ state: IngredientsState; collapsible: boolean }> = ({
  state,
  collapsible
}) => {
  const t = useT()
  const { list } = state
  const { panel } = usePanel()
  const [open, setOpen] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<ChipFilter>(NO_CHIP_FILTER)
  const [plusOpen, setPlusOpen] = useState(false)
  const closePlus = useCallback((refocus: boolean) => {
    setPlusOpen(false)
    if (refocus) focusById(PLUS_ID)
  }, [])
  const shown = list.extraChips.filter((chip) => chipMatches(chip, filter))
  const onPick = (item: LibraryIngredient) => {
    if (state.pick(item)) setPlusOpen(false)
  }
  return (
    <Section
      id={EXTRA_ID}
      title={t('extra.title')}
      collapsible={collapsible}
      open={open}
      onToggle={() => setOpen(!open)}
      summary={extraSummary(list.extraChips.length)}
    >
      <div className="flex flex-col gap-4">
        <ActionsRow label={t('extra.actions')}>
          <FilterButton
            panelId={FILTER_ID}
            open={filterOpen}
            active={chipFilterCount(filter)}
            onPress={() => setFilterOpen(!filterOpen)}
          />
        </ActionsRow>
        <ChipFilterPanel
          id={FILTER_ID}
          open={filterOpen}
          label={t('extra.filter')}
          statuses={EXTRA_STATUSES}
          filter={filter}
          onChange={setFilter}
        />
        {list.extraChips.length === 0 && (
          <p className="m-0 text-text-secondary">{NO_EXTRA_HINT}</p>
        )}
        {chipFilterOn(filter) && (
          <HiddenNote
            hidden={list.extraChips.length - shown.length}
            onClear={() => setFilter(NO_CHIP_FILTER)}
          />
        )}
        <ChipGroups
          groups={groupChips(shown)}
          view={chipView(state, EXTRA_SCOPE, panel, extraAmount)}
        />
        <div>
          <PlusButton
            open={plusOpen}
            onPress={() => setPlusOpen(!plusOpen)}
          />
          <PlusArea
            open={plusOpen}
            onClose={closePlus}
            onPick={onPick}
            hasChip={list.hasChip}
          />
        </div>
      </div>
    </Section>
  )
}
