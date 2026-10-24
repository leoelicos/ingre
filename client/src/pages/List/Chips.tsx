import type { FC } from 'react'
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
  Radio,
  RadioGroup,
  ToggleButton
} from 'react-aria-components'
import { Chevron, collapseClass } from '../../components/Collapse'
import { IngredientBadge } from '../../components/IngredientBadge/IngredientBadge'
import {
  TONE_CLASSES,
  sectionTone
} from '../../components/IngredientBadge/badgeTone'
import type { Chip, ChipGroup } from '../../utils/chips/chips'
import { categoryLabel, needsSort, showsCount } from '../../utils/chips/chips'
import type { ShopSection } from '../../utils/shopping/sections'
import { SHOP_SECTIONS } from '../../utils/shopping/sections'
import { buyAmount, displayName } from '../../utils/shopping/shoppingList'
import {
  chipChevronId,
  chipLabel,
  chipCategoryId,
  chipPanelId,
  chipToggleId,
  usedInText
} from './chipText'

/** What a chip can do; the page owns the state. */
export interface ChipActions {
  readonly onToggle: (id: string) => void
  readonly onQuantity: (id: string, quantity: number) => void
  readonly onCategory: (id: string, section: ShopSection) => void
  readonly onSortNow: (id: string) => void
  readonly onRemove: (id: string) => void
}

/** Which chip's panel is open, or closing (kept mounted so it can animate shut). */
export interface PanelState {
  readonly id: string | null
  readonly open: boolean
  readonly onChevron: (id: string) => void
  readonly onDone: (id: string) => void
}

/** "Dairy, Eggs & Fridge" -> "chips-dairy-eggs-fridge" */
export const groupHeadingId = (section: ShopSection): string =>
  `chips-${section.toLowerCase().replace(/[^a-z]+/g, '-')}`

const toneOf = (section: ShopSection): string =>
  TONE_CLASSES[sectionTone(section)]

const SMALL_BUTTON =
  'inline-flex min-h-[44px] items-center justify-center rounded-pill border-2 border-current px-4 text-sm font-semibold data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

const DONE_BUTTON =
  'inline-flex min-h-[44px] items-center justify-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

/** The chip itself: tap to cross off or restore. It never moves on its own. */
const ChipToggle: FC<{ chip: Chip; onToggle: (id: string) => void }> = ({
  chip,
  onToggle
}) => (
  <ToggleButton
    id={chipToggleId(chip.id)}
    isSelected={chip.crossed}
    onChange={() => onToggle(chip.id)}
    aria-label={chipLabel(chip)}
    className="flex min-h-[44px] items-center gap-2 rounded-l-pill py-1 pl-1 pr-2 text-left data-[focus-visible]:focus-ring"
  >
    <IngredientBadge
      name={chip.line.name}
      category=""
      tone={sectionTone(chip.section)}
    />
    <span
      className={`flex flex-col leading-tight ${
        chip.crossed ? 'line-through opacity-70' : ''
      }`}
    >
      <span className="font-semibold">{displayName(chip.line)}</span>
      <span className="text-xs">{buyAmount(chip.line)}</span>
    </span>
    {showsCount(chip) && (
      <span
        aria-hidden="true"
        data-testid="chip-count"
        className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-pill bg-surface px-1 text-xs font-bold text-text"
      >
        {chip.line.recipes.length}
      </span>
    )}
  </ToggleButton>
)

/** A chip and its chevron, coloured by its current category. */
const ChipItem: FC<{
  chip: Chip
  actions: ChipActions
  panel: PanelState
}> = ({ chip, actions, panel }) => {
  const expanded = panel.open && panel.id === chip.id
  return (
    <li
      data-chip={chip.id}
      data-category={categoryLabel(chip.section)}
      className={`flex items-stretch rounded-pill border ${toneOf(
        chip.section
      )}`}
    >
      <ChipToggle
        chip={chip}
        onToggle={actions.onToggle}
      />
      <Button
        id={chipChevronId(chip.id)}
        aria-label={`${displayName(chip.line)} details`}
        aria-expanded={expanded}
        aria-controls={chipPanelId(chip.id)}
        onPress={() => panel.onChevron(chip.id)}
        className="flex min-h-[44px] min-w-[40px] items-center justify-center rounded-r-pill border-l border-current pr-1 data-[focus-visible]:focus-ring"
      >
        <Chevron open={expanded} />
      </Button>
    </li>
  )
}

/** Quantity, editable (#179). Whole numbers from 1. */
const QuantityField: FC<{ chip: Chip; actions: ChipActions }> = ({
  chip,
  actions
}) => (
  <NumberField
    value={chip.quantity}
    minValue={1}
    step={1}
    onChange={(value) =>
      [value]
        .filter((n) => Number.isInteger(n) && n >= 1)
        .forEach((n) => actions.onQuantity(chip.id, n))
    }
    className="flex flex-col gap-1"
  >
    <Label className="text-sm font-semibold">Quantity</Label>
    <Group className="flex items-center gap-2">
      <Button
        slot="decrement"
        className={SMALL_BUTTON}
      >
        −
      </Button>
      <Input className="h-11 w-16 rounded-control border border-border bg-surface px-2 text-center text-text focus-visible:focus-ring" />
      <Button
        slot="increment"
        className={SMALL_BUTTON}
      >
        +
      </Button>
    </Group>
  </NumberField>
)

/** Category, editable: only the chip's colour changes until Sort now or Sort. */
const CategoryField: FC<{ chip: Chip; actions: ChipActions }> = ({
  chip,
  actions
}) => (
  <RadioGroup
    id={chipCategoryId(chip.id)}
    value={chip.section}
    onChange={(value) =>
      SHOP_SECTIONS.filter((section) => section === value).forEach((section) =>
        actions.onCategory(chip.id, section)
      )
    }
    orientation="horizontal"
    className="flex flex-col gap-1"
  >
    <div className="flex flex-wrap items-center gap-2">
      <Label className="text-sm font-semibold">Category</Label>
      {needsSort(chip) && (
        <Button
          onPress={() => actions.onSortNow(chip.id)}
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

/** The chip's inline panel: pushes the chips below it down. */
const ChipPanel: FC<{
  chip: Chip
  actions: ChipActions
  panel: PanelState
}> = ({ chip, actions, panel }) => {
  const open = panel.open && panel.id === chip.id
  return (
    <li
      id={chipPanelId(chip.id)}
      hidden={!open}
      className={`basis-full ${collapseClass(open)}`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="p-1.5">
          <div
            role="group"
            aria-label={`${displayName(chip.line)} details`}
            className={`rounded-card border-2 p-1 ${toneOf(chip.section)}`}
          >
            <div className="flex flex-col gap-4 rounded-[10px] bg-surface p-3 text-text">
              <div>
                <h4 className="m-0 text-sm font-semibold">Used in</h4>
                <ul className="m-0 list-disc pl-5 text-sm">
                  {usedInText(chip).map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
              <QuantityField
                chip={chip}
                actions={actions}
              />
              <CategoryField
                chip={chip}
                actions={actions}
              />
              <div className="flex flex-wrap gap-2">
                {chip.extra && (
                  <Button
                    onPress={() => actions.onRemove(chip.id)}
                    className={SMALL_BUTTON}
                  >
                    Remove
                  </Button>
                )}
                <Button
                  onPress={() => panel.onDone(chip.id)}
                  className={DONE_BUTTON}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

/** Chips under their category headings; the open chip's panel follows it in the flow. */
export const ChipGroups: FC<{
  groups: readonly ChipGroup[]
  actions: ChipActions
  panel: PanelState
}> = ({ groups, actions, panel }) => (
  <div className="flex flex-col gap-4">
    {groups.map((group) => (
      <div
        key={group.section}
        role="group"
        aria-labelledby={groupHeadingId(group.section)}
      >
        <h3
          id={groupHeadingId(group.section)}
          className="m-0 mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary"
        >
          {categoryLabel(group.section)}
        </h3>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {group.chips.flatMap((chip) => [
            <ChipItem
              key={chip.id}
              chip={chip}
              actions={actions}
              panel={panel}
            />,
            ...(panel.id === chip.id
              ? [
                  <ChipPanel
                    key={`${chip.id}-panel`}
                    chip={chip}
                    actions={actions}
                    panel={panel}
                  />
                ]
              : [])
          ])}
        </ul>
      </div>
    ))}
  </div>
)
