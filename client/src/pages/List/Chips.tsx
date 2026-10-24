import { useT } from '../../i18n'
import type { FC, ReactNode } from 'react'
import { useLayoutEffect, useRef } from 'react'
import { Button, ToggleButton } from 'react-aria-components'
import {
  COLLAPSE_INNER,
  Chevron,
  MOTION,
  collapseClass
} from '../../components/Collapse'
import {
  TONE_CLASSES,
  sectionTone
} from '../../components/IngredientBadge/badgeTone'
import type { BadgeTone } from '../../components/IngredientBadge/tones'
import type { Chip, ChipGroup } from '../../utils/chips/chips'
import { categoryLabel } from '../../utils/chips/chips'
import type { ShopSection } from '../../utils/shopping/sections'
import { displayName } from '../../utils/shopping/shoppingList'
import type { ChipScope } from './chipText'
import { chipChevronId, chipLabel, chipPanelId, chipToggleId } from './chipText'

/** Which chip's panel is open, or closing (kept mounted so it can animate shut). */
export interface PanelState {
  readonly id: string | null
  readonly open: boolean
  readonly onChevron: (id: string) => void
}

/** How a set of chips is shown and what a tap does (#182: Ingredients, Extra and recipe rows). */
export interface ChipView {
  readonly scope: ChipScope
  /** the amount under the name */
  readonly amountOf: (chip: Chip) => string
  readonly onToggle: (id: string) => void
  readonly panel: PanelState
  /** the open panel's content */
  readonly details: (chip: Chip) => ReactNode
}

/** "Dairy, Eggs & Fridge" -> "chips-dairy-eggs-fridge"; scoped outside Ingredients. */
export const groupHeadingId = (section: ShopSection, scope = 'chip'): string =>
  `${scope}s-${section.toLowerCase().replace(/[^a-z]+/g, '-')}`

export const toneOf = (section: ShopSection): string =>
  TONE_CLASSES[sectionTone(section)]

export const SMALL_BUTTON =
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

/**
 * The chip itself: a tap anywhere, the checkbox included, crosses off or restores (#181). A
 * greyed chip (removed from every recipe) can't be crossed off (#182).
 */
const ChipToggle: FC<{ chip: Chip; view: ChipView }> = ({ chip, view }) => {
  const amount = view.amountOf(chip)
  return (
    <ToggleButton
      id={chipToggleId(chip.id, view.scope)}
      isSelected={chip.crossed}
      isDisabled={chip.greyed}
      onChange={() => view.onToggle(chip.id)}
      aria-label={chipLabel(chip, amount)}
      className="flex min-h-[44px] items-center gap-2 rounded-l-pill py-1 pl-3 pr-1 text-left data-[focus-visible]:focus-ring"
    >
      <ChipCheck crossed={chip.crossed} />
      <span
        className={`flex flex-col leading-tight ${
          chip.crossed ? 'line-through opacity-70' : ''
        }`}
      >
        <span className="font-semibold">{displayName(chip)}</span>
        <span className="text-xs">{amount}</span>
      </span>
    </ToggleButton>
  )
}

/**
 * Skeuomorphic chip (#181): a lit, raised pill that sinks in once crossed off. Its own soft
 * shadow and the gap keep it apart from its neighbours. Greyed, it is flat and dashed (#182).
 */
export const chipClass = (
  chip: Pick<Chip, 'crossed' | 'section' | 'greyed'>
): string =>
  chip.greyed
    ? 'flex items-center gap-1 rounded-pill border-2 border-dashed border-text-secondary bg-surface text-text-secondary'
    : `flex items-center gap-1 rounded-pill border bg-gradient-to-b from-white/50 to-white/0 transition-shadow ${MOTION} ${
        chip.crossed ? 'shadow-pressed' : 'shadow-raised'
      } ${toneOf(chip.section)}`

/** The chevron: a neumorphic button of its own, pressed in while its panel is open. */
const chevronClass = (expanded: boolean): string =>
  `m-1 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-pill bg-surface/60 transition-shadow ${MOTION} data-[focus-visible]:focus-ring ${
    expanded ? 'shadow-pressed' : 'shadow-raised'
  }`

/** A chip and its chevron, coloured by its current category. */
const ChipItem: FC<{ chip: Chip; view: ChipView }> = ({ chip, view }) => {
  const t = useT()
  const expanded = view.panel.open && view.panel.id === chip.id
  return (
    <li
      data-chip={chip.id}
      data-scope={view.scope}
      data-category={categoryLabel(chip.section)}
      data-greyed={chip.greyed}
      className={chipClass(chip)}
    >
      <ChipToggle
        chip={chip}
        view={view}
      />
      <Button
        id={chipChevronId(chip.id, view.scope)}
        aria-label={t('chip.details', { name: displayName(chip) })}
        aria-expanded={expanded}
        aria-controls={chipPanelId(chip.id, view.scope)}
        onPress={() => view.panel.onChevron(chip.id)}
        className={chevronClass(expanded)}
      >
        <Chevron open={expanded} />
      </Button>
    </li>
  )
}

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
const ChipPanel: FC<{ chip: Chip; view: ChipView }> = ({ chip, view }) => {
  const t = useT()
  const open = view.panel.open && view.panel.id === chip.id
  const ref = useFan(chip.id, open)
  return (
    <li
      ref={ref}
      id={chipPanelId(chip.id, view.scope)}
      hidden={!open}
      data-fan=""
      className={`basis-full ${FAN} ${
        FAN_TONES[sectionTone(chip.section)]
      } ${collapseClass(open)}`}
    >
      <div className={COLLAPSE_INNER}>
        <div className="p-1.5">
          <div
            role="group"
            aria-label={t('chip.details', { name: displayName(chip) })}
            className={`rounded-card border-2 p-1 ${toneOf(chip.section)}`}
          >
            <div className="flex flex-col gap-4 rounded-[10px] bg-surface p-3 text-text">
              {view.details(chip)}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

/** Chips in a wrapping row; the open chip's panel follows it in the flow. */
export const ChipList: FC<{ chips: readonly Chip[]; view: ChipView }> = ({
  chips,
  view
}) => (
  <ul className="relative m-0 flex list-none flex-wrap gap-3 p-0">
    {chips.flatMap((chip) => [
      <ChipItem
        key={chip.id}
        chip={chip}
        view={view}
      />,
      ...(view.panel.id === chip.id
        ? [
            <ChipPanel
              key={`${chip.id}-panel`}
              chip={chip}
              view={view}
            />
          ]
        : [])
    ])}
  </ul>
)

/** Chips under their category headings. */
export const ChipGroups: FC<{
  groups: readonly ChipGroup[]
  view: ChipView
}> = ({ groups, view }) => (
  <div className="flex flex-col gap-4">
    {groups.map((group) => (
      <div
        key={group.section}
        role="group"
        aria-labelledby={groupHeadingId(group.section, view.scope)}
      >
        <h3
          id={groupHeadingId(group.section, view.scope)}
          className="m-0 mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary"
        >
          {categoryLabel(group.section)}
        </h3>
        <ChipList
          chips={group.chips}
          view={view}
        />
      </div>
    ))}
  </div>
)
