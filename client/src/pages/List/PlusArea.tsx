import { translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect } from 'react'
import { Button, Tab, TabList, TabPanel, Tabs } from 'react-aria-components'
import { COLLAPSE_INNER, collapseClass } from '../../components/Collapse'
import {
  TONE_CLASSES,
  sectionTone
} from '../../components/SectionTone/badgeTone'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { categoryLabel } from '../../utils/chips/chips'
import { catalogue } from '../../utils/library/recipeLibrary'
import type { ShopSection } from '../../utils/shopping/sections'
import { SHOP_SECTIONS, placeInShop } from '../../utils/shopping/sections'

/** One tab per category the catalogue has items in, in shop order. */
export interface PlusTab {
  readonly section: ShopSection
  readonly items: readonly LibraryIngredient[]
}

export const plusTabs = (
  items: readonly LibraryIngredient[] = catalogue
): PlusTab[] =>
  SHOP_SECTIONS.map((section) => ({
    section,
    items: items.filter(
      (item) => placeInShop(item.category).section === section
    )
  })).filter((tab) => tab.items.length > 0)

/** True when the press landed outside the plus button and its area (both carry data-plus-zone). */
export const isOutside = (target: EventTarget | null): boolean =>
  !(target instanceof Element && target.closest('[data-plus-zone]') !== null)

/** Closes the area on a press outside it, and on Escape (focus goes back to the plus). */
const useDismiss = (open: boolean, onClose: (refocus: boolean) => void) => {
  useEffect(() => {
    if (!open) return
    const onPointer = (e: Event) => {
      if (isOutside(e.target)) onClose(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(true)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
}

const ROW =
  'flex min-h-[44px] w-full items-center gap-3 rounded-control px-2 py-1 text-left text-text data-[hovered]:bg-chip-active data-[focus-visible]:focus-ring'

/** The note on an item already there: "On your list", or "In this recipe" in a row. */
export const ON_LIST = translate('plus.onList')

const ItemRow: FC<{
  item: LibraryIngredient
  mark: string | null
  onPick: (item: LibraryIngredient) => void
}> = ({ item, mark, onPick }) => (
  <Button
    onPress={() => onPick(item)}
    aria-label={
      mark === null
        ? capitaliseFirst(item.name)
        : translate('plus.marked', {
            name: capitaliseFirst(item.name),
            mark: mark.toLowerCase()
          })
    }
    className={ROW}
  >
    <span className="flex-1">{capitaliseFirst(item.name)}</span>
    {mark !== null && (
      <span className="text-xs font-semibold text-text-secondary">{mark}</span>
    )}
  </Button>
)

/** The plus button: opens a recipe's add area in place, below its last chip. */
export const PlusButton: FC<{
  open: boolean
  onPress: () => void
  id: string
  areaId: string
  label: string
}> = ({ open, onPress, id, areaId, label }) => (
  <span
    data-plus-zone=""
    className="inline-flex"
  >
    <Button
      id={id}
      aria-label={label}
      aria-expanded={open}
      aria-controls={areaId}
      onPress={onPress}
      className="inline-flex h-11 w-11 items-center justify-center rounded-pill border-2 border-dashed border-text-secondary text-2xl leading-none text-text data-[focus-visible]:focus-ring"
    >
      <span aria-hidden="true">+</span>
    </Button>
  </span>
)

/**
 * The catalogue by category (#179): one tab per category, a row per item. Used by the add area
 * in a recipe and, from #192, in the Extra sheet.
 */
export const CategoryTabs: FC<{
  onPick: (item: LibraryIngredient) => void
  hasChip: (id: string) => boolean
  mark: string
}> = ({ onPick, hasChip, mark }) => {
  const t = useT()
  return (
    <Tabs className="flex flex-col gap-2 rounded-[10px] bg-surface p-3">
      <TabList
        aria-label={t('plus.categories')}
        className="flex flex-wrap gap-2"
      >
        {plusTabs().map((tab) => (
          <Tab
            key={tab.section}
            id={tab.section}
            className={`inline-flex min-h-[44px] cursor-pointer items-center rounded-pill border px-3 text-sm data-[selected]:border-2 data-[selected]:font-bold data-[focus-visible]:focus-ring ${
              TONE_CLASSES[sectionTone(tab.section)]
            }`}
          >
            {categoryLabel(tab.section)}
          </Tab>
        ))}
      </TabList>
      {plusTabs().map((tab) => (
        <TabPanel
          key={tab.section}
          id={tab.section}
          className="rounded-control data-[focus-visible]:focus-ring"
        >
          <ul className="m-0 grid max-h-80 list-none grid-cols-1 gap-1 overflow-y-auto p-1 sm:grid-cols-2">
            {tab.items.map((item) => (
              <li key={item.id}>
                <ItemRow
                  item={item}
                  mark={hasChip(item.id) ? mark : null}
                  onPick={onPick}
                />
              </li>
            ))}
          </ul>
        </TabPanel>
      ))}
    </Tabs>
  )
}

/**
 * The add area (#179): styled like an open chip, with category tabs instead of Used in.
 * Picking a row adds it as a chip; picking one already on the list opens that chip instead.
 */
export const PlusArea: FC<{
  open: boolean
  onClose: (refocus: boolean) => void
  onPick: (item: LibraryIngredient) => void
  hasChip: (id: string) => boolean
  id: string
  label: string
  mark: string
}> = ({ open, onClose, onPick, hasChip, id, label, mark }) => {
  useDismiss(open, onClose)
  return (
    <div
      id={id}
      hidden={!open}
      className={collapseClass(open)}
    >
      <div className={COLLAPSE_INNER}>
        <div className="p-1.5">
          <div
            data-plus-zone=""
            role="group"
            aria-label={label}
            className="rounded-card border-2 border-text-secondary p-1"
          >
            <CategoryTabs
              onPick={onPick}
              hasChip={hasChip}
              mark={mark}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
