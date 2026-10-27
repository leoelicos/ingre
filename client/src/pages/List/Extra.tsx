import { formatItemCount, translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import { groupChips } from '../../utils/chips/chips'
import type { ChipFilter } from '../../utils/filters/filters'
import {
  EXTRA_STATUSES,
  NO_CHIP_FILTER,
  chipFilterOn,
  chipMatches
} from '../../utils/filters/filters'
import { Sheet } from '../../components/Sheet'
import { ChipGroups } from './Chips'
import { EXTRA_SCOPE, extraAmount } from './chipText'
import {
  ActionsRow,
  ChipFilterPanel,
  FilterButton,
  HiddenNote
} from './Filters'
import type { IngredientsState } from './Ingredients'
import { EXTRA_SHEET_ID, chipFilterCount, chipView } from './Ingredients'
import { CategoryTabs, ON_LIST } from './PlusArea'
import { usePanel } from './usePanel'

export const EXTRA_ID = 'extra'

/** Shown when nothing is in Extra (#182, answer 11). */
export const NO_EXTRA_HINT = translate('extra.empty')

/** "3 items" */
export const extraSummary = (n: number): string => formatItemCount(n)

const FILTER_ID = `${EXTRA_ID}-filter`

/** The heading over the catalogue in the Extra sheet. */
const ADD_HEADING_ID = `${EXTRA_ID}-add`

/**
 * Extra (#182, #192): everything added by hand, staples included, now in the sheet that
 * "+ Pantry Item" opens. The same chips as in Ingredients, showing their Extra amount, then
 * the catalogue by category to add more.
 */
export const ExtraBody: FC<{ state: IngredientsState }> = ({ state }) => {
  const t = useT()
  const { list } = state
  const { panel } = usePanel()
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<ChipFilter>(NO_CHIP_FILTER)
  const shown = list.extraChips.filter((chip) => chipMatches(chip, filter))
  return (
    <div
      id={EXTRA_ID}
      className="flex flex-col gap-4 p-1.5"
    >
      <p className="m-0 text-sm text-text-secondary">
        {extraSummary(list.extraChips.length)}
      </p>
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
      <section
        aria-labelledby={ADD_HEADING_ID}
        className="flex flex-col gap-2"
      >
        <h3
          id={ADD_HEADING_ID}
          className="m-0 text-base font-bold"
        >
          {t('plus.add')}
        </h3>
        <CategoryTabs
          onPick={state.add}
          hasChip={list.hasChip}
          mark={ON_LIST}
        />
      </section>
    </div>
  )
}

/** The Extra sheet (#192): a bottom sheet on mobile, a centred modal from 576px. */
export const ExtraSheet: FC<{
  state: IngredientsState
  isOpen: boolean
  onClose: () => void
}> = ({ state, isOpen, onClose }) => {
  const t = useT()
  return (
    <Sheet
      id={EXTRA_SHEET_ID}
      title={t('extra.title')}
      isOpen={isOpen}
      onClose={onClose}
      status={state.message}
      top={null}
    >
      <ExtraBody state={state} />
    </Sheet>
  )
}
