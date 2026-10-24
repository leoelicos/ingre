import type { FC } from 'react'
import { useLayoutEffect, useRef } from 'react'
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
import { Chevron, MOTION, collapseClass } from '../../components/Collapse'
import { AllergenTags } from '../../components/AllergenTags'
import {
  TONE_CLASSES,
  sectionTone
} from '../../components/IngredientBadge/badgeTone'
import type { BadgeTone } from '../../components/IngredientBadge/tones'
import type { Chip, ChipGroup } from '../../utils/chips/chips'
import { categoryLabel, needsSort } from '../../utils/chips/chips'
import { allergensOf } from '../../utils/library/allergens'
import { catalogue } from '../../utils/library/recipeLibrary'
import type { ShopSection } from '../../utils/shopping/sections'
import { SHOP_SECTIONS } from '../../utils/shopping/sections'
import {
  buyAmount,
  catalogueIdOf,
  displayName
} from '../../utils/shopping/shoppingList'
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
}

/** "Dairy, Eggs & Fridge" -> "chips-dairy-eggs-fridge" */
export const groupHeadingId = (section: ShopSection): string =>
  `chips-${section.toLowerCase().replace(/[^a-z]+/g, '-')}`

const toneOf = (section: ShopSection): string =>
  TONE_CLASSES[sectionTone(section)]

const SMALL_BUTTON =
  'inline-flex min-h-[44px] items-center justify-center rounded-pill border-2 border-current px-4 text-sm font-semibold data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

/** The checkbox in the chip: ticked once crossed off. The chip itself is the control. */
const ChipCheck: FC<{ crossed: boolean }> = ({ crossed }) => (
  <span
    aria-hidden="true"
    data-testid="chip-check"
    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-current text-xs font-bold shadow-pressed ${
      crossed ? 'bg-surface' : ''
    }`}
  >
    {crossed ? '✓' : ''}
  </span>
)

/** The chip itself: a tap anywhere, the checkbox included, crosses off or restores (#181). */
const ChipToggle: FC<{ chip: Chip; onToggle: (id: string) => void }> = ({
  chip,
  onToggle
}) => (
  <ToggleButton
    id={chipToggleId(chip.id)}
    isSelected={chip.crossed}
    onChange={() => onToggle(chip.id)}
    aria-label={chipLabel(chip)}
    className="flex min-h-[44px] items-center gap-2 rounded-l-pill py-1 pl-3 pr-1 text-left data-[focus-visible]:focus-ring"
  >
    <ChipCheck crossed={chip.crossed} />
    <span
      className={`flex flex-col leading-tight ${
        chip.crossed ? 'line-through opacity-70' : ''
      }`}
    >
      <span className="font-semibold">{displayName(chip.line)}</span>
      <span className="text-xs">{buyAmount(chip.line)}</span>
    </span>
  </ToggleButton>
)

/**
 * Skeuomorphic chip (#181): a lit, raised pill that sinks in once crossed off. Its own soft
 * shadow and the gap keep it apart from its neighbours.
 */
export const chipClass = (chip: Pick<Chip, 'crossed' | 'section'>): string =>
  `flex items-center gap-1 rounded-pill border bg-gradient-to-b from-white/50 to-white/0 transition-shadow ${MOTION} ${
    chip.crossed ? 'shadow-pressed' : 'shadow-raised'
  } ${toneOf(chip.section)}`

/** The chevron: a neumorphic button of its own, pressed in while its panel is open. */
const chevronClass = (expanded: boolean): string =>
  `m-1 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-pill bg-surface/60 transition-shadow ${MOTION} data-[focus-visible]:focus-ring ${
    expanded ? 'shadow-pressed' : 'shadow-raised'
  }`

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
      className={chipClass(chip)}
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
        className={chevronClass(expanded)}
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

/** The fan's colour: the chip's own, so the panel reads as coming out of that chip. */
const FAN_TONES: Readonly<Record<BadgeTone, string>> = {
  produce: 'before:bg-badge-produce-ink',
  meat: 'before:bg-badge-meat-ink',
  dairy: 'before:bg-badge-dairy-ink',
  deli: 'before:bg-badge-deli-ink',
  bakery: 'before:bg-badge-bakery-ink',
  pantry: 'before:bg-badge-pantry-ink',
  frozen: 'before:bg-badge-frozen-ink',
  neutral: 'before:bg-badge-neutral-ink'
}

/**
 * The fan (#181): a pseudo-element that widens from under the chip down to the panel. Its
 * place comes from CSS variables, measured from the chip, so the panel itself never moves.
 */
const FAN =
  "relative before:pointer-events-none before:absolute before:left-[var(--fan-x)] before:top-[var(--fan-top)] before:h-[var(--fan-h)] before:w-[var(--fan-w)] before:-translate-x-1/2 before:opacity-40 before:content-[''] before:[clip-path:polygon(30%_0,70%_0,100%_100%,0_100%)]"

/** Where the fan goes: from the chip's bottom edge (centred on it) to the panel's top. */
export interface Fan {
  readonly x: number
  readonly top: number
  readonly height: number
  readonly width: number
}

export const fanFor = (
  chip: Pick<
    HTMLElement,
    'offsetLeft' | 'offsetTop' | 'offsetWidth' | 'offsetHeight'
  >,
  panel: Pick<HTMLElement, 'offsetLeft' | 'offsetTop'>
): Fan => {
  const top = chip.offsetTop + chip.offsetHeight - panel.offsetTop
  return {
    x: chip.offsetLeft + chip.offsetWidth / 2 - panel.offsetLeft,
    top,
    height: Math.max(0, -top) + 8,
    width: chip.offsetWidth * 1.6
  }
}

const setFan = (panel: HTMLElement, fan: Fan): void => {
  panel.style.setProperty('--fan-x', `${fan.x}px`)
  panel.style.setProperty('--fan-top', `${fan.top}px`)
  panel.style.setProperty('--fan-h', `${fan.height}px`)
  panel.style.setProperty('--fan-w', `${fan.width}px`)
}

/** Measures the fan when the panel opens and whenever the window resizes. */
const useFan = (chipId: string, open: boolean) => {
  const ref = useRef<HTMLLIElement>(null)
  useLayoutEffect(() => {
    const panel = ref.current
    const chip = panel?.previousElementSibling
    if (!open || !panel || !(chip instanceof HTMLElement)) return
    const measure = () => setFan(panel, fanFor(chip, panel))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [chipId, open])
  return ref
}

/** The chip's inline panel: pushes the chips below it down. Changes apply as they are made. */
const ChipPanel: FC<{
  chip: Chip
  actions: ChipActions
  panel: PanelState
}> = ({ chip, actions, panel }) => {
  const open = panel.open && panel.id === chip.id
  const ref = useFan(chip.id, open)
  return (
    <li
      ref={ref}
      id={chipPanelId(chip.id)}
      hidden={!open}
      data-fan=""
      className={`basis-full ${FAN} ${
        FAN_TONES[sectionTone(chip.section)]
      } ${collapseClass(open)}`}
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
              <AllergenTags
                allergens={allergensOf(
                  catalogueIdOf(chip.line.ingredientId),
                  catalogue
                )}
              />
              <QuantityField
                chip={chip}
                actions={actions}
              />
              <CategoryField
                chip={chip}
                actions={actions}
              />
              {chip.extra && (
                <div>
                  <Button
                    onPress={() => actions.onRemove(chip.id)}
                    className={SMALL_BUTTON}
                  >
                    Remove
                  </Button>
                </div>
              )}
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
        <ul className="relative m-0 flex list-none flex-wrap gap-3 p-0">
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
