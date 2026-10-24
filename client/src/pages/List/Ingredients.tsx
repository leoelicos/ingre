import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from 'react-aria-components'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import type { ChipsState } from '../../utils/chips/useChips'
import { focusById, focusCheckedIn, revealById } from '../../utils/focus'
import type { ChipActions, PanelState } from './Chips'
import { ChipGroups } from './Chips'
import { chipCategoryId, chipChevronId } from './chipText'
import { PLUS_ID, PlusArea, PlusButton } from './PlusArea'
import { Section } from './Section'

export const INGREDIENTS_ID = 'ingredients'
export const INGREDIENTS_HEADING_ID = `${INGREDIENTS_ID}-heading`

/** Shown when there are no chips yet. */
export const NO_CHIPS_HINT =
  'Nothing on your list yet. Tick recipes in Explore, or add an ingredient with the plus.'

/** "5 items, 2 crossed off" */
export const ingredientsSummary = (
  chips: readonly { crossed: boolean }[]
): string => {
  const crossed = chips.filter((chip) => chip.crossed).length
  const items = `${chips.length} ${chips.length === 1 ? 'item' : 'items'}`
  return crossed === 0 ? items : `${items}, ${crossed} crossed off`
}

/** Where focus goes after the next render, once the chip has moved or opened. */
interface FocusTarget {
  readonly kind: 'reveal' | 'checked'
  readonly id: string
}

const FOCUS: Readonly<Record<FocusTarget['kind'], (id: string) => void>> = {
  reveal: revealById,
  checked: focusCheckedIn
}

const useFocusAfterRender = () => {
  const [target, setTarget] = useState<FocusTarget | null>(null)
  useEffect(() => {
    if (target === null) return
    FOCUS[target.kind](target.id)
    setTarget(null)
  }, [target])
  return setTarget
}

/** One chip panel open at a time; the last one stays mounted so it can animate shut. */
const usePanel = () => {
  const [id, setId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const show = (chipId: string) => {
    setId(chipId)
    setOpen(true)
  }
  const panel: PanelState = {
    id,
    open,
    onChevron: (chipId) =>
      open && id === chipId ? setOpen(false) : show(chipId)
  }
  return { panel, show, close: () => setOpen(false) }
}

const SORT_BUTTON =
  'inline-flex min-h-[44px] items-center rounded-pill border-2 border-primary px-4 text-sm font-semibold text-primary data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

/**
 * Everything the Ingredients section shares with Explore (#181): the open chip panel, the
 * section's open state, and picking a catalogue item (from the plus or an Explore result):
 * a new one is added as an extra; one already on the list is scrolled to with its panel open.
 */
export const useIngredients = (list: ChipsState) => {
  const { panel, show, close } = usePanel()
  const [open, setOpen] = useState(true)
  const [message, setMessage] = useState('')
  const focusAfterRender = useFocusAfterRender()
  const pick = (item: LibraryIngredient): boolean => {
    if (list.hasChip(item.id)) {
      setOpen(true)
      show(item.id)
      focusAfterRender({ kind: 'reveal', id: chipChevronId(item.id) })
      return true
    }
    list.addExtra(item)
    setMessage(`${capitaliseFirst(item.name)} added`)
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
    focusAfterRender,
    pick
  }
}

export type IngredientsState = ReturnType<typeof useIngredients>

/** The Ingredients section (#179): Sort, the chips by category, and the plus. */
export const Ingredients: FC<{
  state: IngredientsState
  collapsible: boolean
}> = ({ state, collapsible }) => {
  const { list, panel, close, setMessage, focusAfterRender } = state
  const [plusOpen, setPlusOpen] = useState(false)
  const closePlus = useCallback((refocus: boolean) => {
    setPlusOpen(false)
    if (refocus) focusById(PLUS_ID)
  }, [])
  const actions: ChipActions = {
    onToggle: list.toggleCrossed,
    onQuantity: list.setQuantity,
    onCategory: list.setCategory,
    onSortNow: (id) => {
      list.sort()
      focusAfterRender({ kind: 'checked', id: chipCategoryId(id) })
    },
    onRemove: (id) => {
      list.removeExtra(id)
      close()
      setMessage('Removed')
      focusById(PLUS_ID)
    }
  }
  const onPick = (item: LibraryIngredient) => {
    if (state.pick(item)) setPlusOpen(false)
  }
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
        {list.chips.length === 0 ? (
          <p className="m-0 text-text-secondary">{NO_CHIPS_HINT}</p>
        ) : (
          <div>
            <Button
              onPress={list.sort}
              className={SORT_BUTTON}
            >
              Sort
            </Button>
          </div>
        )}
        <ChipGroups
          groups={list.groups}
          actions={actions}
          panel={panel}
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
        <p
          role="status"
          className="sr-only"
        >
          {state.message}
        </p>
      </div>
    </Section>
  )
}
