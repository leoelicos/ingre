import type { FC } from 'react'
import { useEffect } from 'react'
import { Button, Tab, TabList, TabPanel, Tabs } from 'react-aria-components'
import { collapseClass } from '../../components/Collapse'
import { resolveBadgeCode } from '../../components/IngredientBadge/badgeCode'
import { IngredientBadge } from '../../components/IngredientBadge/IngredientBadge'
import {
  TONE_CLASSES,
  sectionTone
} from '../../components/IngredientBadge/badgeTone'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { categoryLabel } from '../../utils/chips/chips'
import { catalogue } from '../../utils/library/recipeLibrary'
import type { ShopSection } from '../../utils/shopping/sections'
import { SHOP_SECTIONS, placeInShop } from '../../utils/shopping/sections'

export const PLUS_ID = 'add-ingredient'
export const PLUS_AREA_ID = 'add-ingredient-area'

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

const ItemRow: FC<{
  item: LibraryIngredient
  onList: boolean
  onPick: (item: LibraryIngredient) => void
}> = ({ item, onList, onPick }) => (
  <Button
    onPress={() => onPick(item)}
    aria-label={`${capitaliseFirst(item.name)}${
      onList ? ', on your list' : ''
    }`}
    className={ROW}
  >
    <IngredientBadge
      name={item.name}
      badgeCode={resolveBadgeCode(item)}
      category={item.category}
    />
    <span className="flex-1">{capitaliseFirst(item.name)}</span>
    {onList && (
      <span className="text-xs font-semibold text-text-secondary">
        On your list
      </span>
    )}
  </Button>
)

/** The plus button: opens the add area in place, below the last chip. */
export const PlusButton: FC<{ open: boolean; onPress: () => void }> = ({
  open,
  onPress
}) => (
  <span
    data-plus-zone=""
    className="inline-flex"
  >
    <Button
      id={PLUS_ID}
      aria-label="Add an ingredient"
      aria-expanded={open}
      aria-controls={PLUS_AREA_ID}
      onPress={onPress}
      className="inline-flex h-11 w-11 items-center justify-center rounded-pill border-2 border-dashed border-text-secondary text-2xl leading-none text-text data-[focus-visible]:focus-ring"
    >
      <span aria-hidden="true">+</span>
    </Button>
  </span>
)

/**
 * The add area (#179): styled like an open chip, with category tabs instead of Used in.
 * Picking a row adds it as a chip; picking one already on the list opens that chip instead.
 */
export const PlusArea: FC<{
  open: boolean
  onClose: (refocus: boolean) => void
  onPick: (item: LibraryIngredient) => void
  hasChip: (id: string) => boolean
}> = ({ open, onClose, onPick, hasChip }) => {
  useDismiss(open, onClose)
  return (
    <div
      id={PLUS_AREA_ID}
      hidden={!open}
      className={collapseClass(open)}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="p-1.5">
          <div
            data-plus-zone=""
            role="group"
            aria-label="Add an ingredient"
            className="rounded-card border-2 border-text-secondary p-1"
          >
            <Tabs className="flex flex-col gap-2 rounded-[10px] bg-surface p-3">
              <TabList
                aria-label="Categories"
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
                          onList={hasChip(item.id)}
                          onPick={onPick}
                        />
                      </li>
                    ))}
                  </ul>
                </TabPanel>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
