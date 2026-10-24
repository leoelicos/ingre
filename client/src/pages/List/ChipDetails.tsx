import type { FC } from 'react'
import { useEffect, useState } from 'react'
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
  Radio,
  RadioGroup
} from 'react-aria-components'
import { AllergenTags } from '../../components/AllergenTags'
import type { Chip, Source } from '../../utils/chips/chips'
import { categoryLabel, needsSort } from '../../utils/chips/chips'
import { focusById } from '../../utils/focus'
import type { ShopSection } from '../../utils/shopping/sections'
import { SHOP_SECTIONS } from '../../utils/shopping/sections'
import { measureWord, rounded } from '../../utils/shopping/shoppingList'
import { unitMeasure } from '../../utils/shopping/units'
import { SMALL_BUTTON, toneOf } from './Chips'
import type { ChipScope } from './chipText'
import {
  chipAmount,
  chipCategoryId,
  confirmYesId,
  sourceFieldId
} from './chipText'

/** The key of a source's box: the recipe id, or "extra". */
export const sourceKey = (source: Source): string =>
  source.kind === 'extra' ? 'extra' : source.recipeId

/** A source's measure: the recipe's own, or the chip's unit for Extra (#182, answers 1 and 3). */
export const sourceMeasure = (
  source: Source,
  chip: Pick<Chip, 'unit'>
): string => (source.kind === 'extra' ? unitMeasure(chip.unit) : source.measure)

/** The unit after a box: "g", "tbsp", "cloves"; empty for whole items. */
export const sourceUnit = (source: Source, chip: Pick<Chip, 'unit'>) =>
  measureWord(source.quantity, sourceMeasure(source, chip))

/** The box's visible label: the recipe's name, or "Extra". */
export const sourceLabel = (source: Source): string =>
  source.kind === 'extra' ? 'Extra' : source.label

/** "Butter chicken, butter (g)"; whole items read "(whole)". */
export const sourceAriaLabel = (
  source: Source,
  chip: Pick<Chip, 'name' | 'unit'>
): string =>
  `${sourceLabel(source)}, ${chip.name} (${
    sourceUnit(source, chip) || 'whole'
  })`

/** "Remove butter from Butter chicken?" or "Remove butter from Extra?" */
export const removeQuestion = (source: Source, name: string): string =>
  `Remove ${name} from ${sourceLabel(source)}?`

const BOX =
  'h-11 w-20 rounded-control border border-border bg-surface px-2 text-center text-text focus-visible:focus-ring'

/**
 * One source's amount (#182). Recipe boxes take decimals in the recipe's unit; the Extra box
 * takes whole numbers in the chip's unit. 0 asks before removing.
 */
export const AmountField: FC<{
  id: string
  label: string
  ariaLabel: string
  unit: string
  value: number
  whole: boolean
  onCommit: (value: number) => void
  onZero: () => void
}> = ({ id, label, ariaLabel, unit, value, whole, onCommit, onZero }) => (
  <NumberField
    value={rounded(value)}
    minValue={0}
    {...(whole ? { step: 1 } : {})}
    formatOptions={{ maximumFractionDigits: whole ? 0 : 2 }}
    aria-label={ariaLabel}
    onChange={(next) => {
      if (!Number.isFinite(next)) return
      if (next === 0) onZero()
      else onCommit(next)
    }}
    className="flex flex-wrap items-center gap-2"
  >
    {/* the box's name is its aria-label, which says the unit too */}
    <span
      aria-hidden="true"
      className="min-w-[8rem] flex-1 text-sm"
    >
      {label}
    </span>
    <Group className="flex items-center gap-2">
      <Input
        id={id}
        className={BOX}
      />
      <span className="min-w-[3rem] text-sm">{unit}</span>
    </Group>
  </NumberField>
)

/** The inline question before a box goes to 0 (#182, F2): Yes removes, No sets it to 1. */
export const RemoveQuestion: FC<{
  yesId: string
  question: string
  onYes: () => void
  onNo: () => void
}> = ({ yesId, question, onYes, onNo }) => {
  /* after the key that typed 0 is done, so its Enter can't press Yes too */
  useEffect(() => {
    const timer = setTimeout(() => focusById(yesId))
    return () => clearTimeout(timer)
  }, [yesId])
  return (
    <div
      role="group"
      aria-label={question}
      className="flex flex-wrap items-center gap-2 rounded-control border-2 border-primary p-2"
    >
      <p className="m-0 flex-1 text-sm font-semibold">{question}</p>
      <Button
        id={yesId}
        onPress={onYes}
        className={SMALL_BUTTON}
      >
        Yes
      </Button>
      <Button
        onPress={onNo}
        className={SMALL_BUTTON}
      >
        No
      </Button>
    </div>
  )
}

/** Category, editable: only the chip's colour changes until Sort now or Sort. */
export const CategoryField: FC<{
  chip: Chip
  scope: ChipScope
  onCategory: (id: string, section: ShopSection) => void
  onSortNow: (id: string) => void
}> = ({ chip, scope, onCategory, onSortNow }) => (
  <RadioGroup
    id={chipCategoryId(chip.id, scope)}
    value={chip.section}
    onChange={(value) =>
      SHOP_SECTIONS.filter((section) => section === value).forEach((section) =>
        onCategory(chip.id, section)
      )
    }
    orientation="horizontal"
    className="flex flex-col gap-1"
  >
    <div className="flex flex-wrap items-center gap-2">
      <Label className="text-sm font-semibold">Category</Label>
      {needsSort(chip) && (
        <Button
          onPress={() => onSortNow(chip.id)}
          className={SMALL_BUTTON}
        >
          Sort now
        </Button>
      )}
    </div>
    <div className="flex flex-wrap gap-2">
      {SHOP_SECTIONS.map((section) => (
        <Radio
          key={section}
          value={section}
          className={`inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-pill border px-3 text-sm data-[selected]:border-2 data-[selected]:font-bold data-[focus-visible]:focus-ring ${toneOf(
            section
          )}`}
        >
          {({ isSelected }) => (
            <>
              {isSelected && <span aria-hidden="true">✓</span>}
              {categoryLabel(section)}
            </>
          )}
        </Radio>
      ))}
    </div>
  </RadioGroup>
)

/** What a chip panel's boxes do; the page owns the state. */
export interface SourceActions {
  readonly onAmount: (source: Source, value: number) => void
  /** after Yes: the source is removed */
  readonly onRemove: (source: Source) => void
}

/**
 * Each source's box with the remove question under the boxes (#182). A box at 0 stays at 0
 * while the question shows; No puts it back to 1.
 */
export const SourceFields: FC<{
  chip: Chip
  scope: ChipScope
  actions: SourceActions
}> = ({ chip, scope, actions }) => {
  const [pending, setPending] = useState<Source | null>(null)
  const pendingKey = pending === null ? null : sourceKey(pending)
  return (
    <>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {chip.sources.map((source) => (
          <li key={sourceKey(source)}>
            <AmountField
              id={sourceFieldId(chip.id, sourceKey(source), scope)}
              label={sourceLabel(source)}
              ariaLabel={sourceAriaLabel(source, chip)}
              unit={sourceUnit(source, chip)}
              value={pendingKey === sourceKey(source) ? 0 : source.quantity}
              whole={source.kind === 'extra'}
              onCommit={(value) => {
                setPending(null)
                actions.onAmount(source, value)
              }}
              onZero={() => setPending(source)}
            />
          </li>
        ))}
      </ul>
      {pending !== null && (
        <RemoveQuestion
          yesId={confirmYesId(chip.id, scope)}
          question={removeQuestion(pending, chip.name)}
          onYes={() => {
            setPending(null)
            actions.onRemove(pending)
          }}
          onNo={() => {
            setPending(null)
            actions.onAmount(pending, 1)
            focusById(sourceFieldId(chip.id, sourceKey(pending), scope))
          }}
        />
      )}
    </>
  )
}

/** The chip's total under its boxes: "Total: 440 g" (#182, F3). */
export const TotalLine: FC<{ chip: Chip }> = ({ chip }) => (
  <p className="m-0 text-sm font-semibold">Total: {chipAmount(chip)}</p>
)

/** Allergens of a chip's item; nothing for free text. */
export const ChipAllergens: FC<{ chip: Chip }> = ({ chip }) => (
  <AllergenTags allergens={chip.item?.allergens ?? []} />
)
