import type { FC, FocusEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Switch } from 'react-aria-components'
import { HeartIcon } from '../../components/Widgets/RecipeCard/components/SaveButton'
import { PHONE_QUERY, useMediaQuery } from '../../utils/useMediaQuery'
import { tagLabel, visibleTags } from '../Home/homeFilters'
import '../Home/home.css'

export const SAVED_FILTER_LABEL = 'Saved'

const SAVED_SWITCH =
  'inline-flex min-h-[32px] shrink-0 cursor-pointer items-center gap-1 rounded-pill border border-border px-[14px] py-1 text-sm text-text data-[selected]:border-primary data-[selected]:bg-chip-active data-[selected]:text-added-pill data-[focus-visible]:focus-ring'

/**
 * The Saved filter (#160): a switch, so VoiceOver reads it as on or off. Hearts are kept on this
 * device, so it works signed out too.
 */
export const SavedFilter: FC<{
  on: boolean
  onChange: (on: boolean) => void
}> = ({ on, onChange }) => (
  <Switch
    isSelected={on}
    onChange={onChange}
    className={SAVED_SWITCH}
  >
    <HeartIcon filled={on} />
    {SAVED_FILTER_LABEL}
  </Switch>
)

/** Keeps a focused chip in a one-row (scrolling) chip list clear of the More chip. */
export const scrollChipIntoRow = (e: FocusEvent<HTMLButtonElement>): void => {
  const chip = e.currentTarget
  const row = chip.closest('.chip-row')
  if (!row || !row.classList.contains('chip-row--one')) return
  const more = row.parentElement?.querySelector('.chip--more')
  const moreWidth = more ? more.getBoundingClientRect().width + 12 : 0
  const chipRect = chip.getBoundingClientRect()
  const rowRect = row.getBoundingClientRect()
  if (chipRect.right > rowRect.right - moreWidth) {
    row.scrollLeft += chipRect.right - (rowRect.right - moreWidth)
  } else if (chipRect.left < rowRect.left) {
    row.scrollLeft -= rowRect.left - chipRect.left
  }
}

/** Escape closes the expanded tag list and puts focus back on More. */
const useCloseOnEscape = (open: boolean, close: () => void) => {
  const moreRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      moreRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])
  return moreRef
}

/** Saved, then the tag chips. On phones the tags collapse to one row with More. */
export const PickFilters: FC<{
  tags: readonly string[]
  selectedTags: readonly string[]
  onToggleTag: (tag: string) => void
  savedOnly: boolean
  onSavedOnly: (on: boolean) => void
}> = ({ tags, selectedTags, onToggleTag, savedOnly, onSavedOnly }) => {
  const phone = useMediaQuery(PHONE_QUERY)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useCloseOnEscape(moreOpen, () => setMoreOpen(false))
  const collapsed = phone && !moreOpen
  const shown = visibleTags(tags, selectedTags, collapsed)
  const hasMore = phone && visibleTags(tags, [], true).length < tags.length
  return (
    <div className="chip-bar">
      <SavedFilter
        on={savedOnly}
        onChange={onSavedOnly}
      />
      <ul
        id="pick-tags"
        className={collapsed ? 'chip-row chip-row--one' : 'chip-row'}
        aria-label="Filter by tag"
      >
        {shown.map((tag) => (
          <li key={tag}>
            <button
              type="button"
              className="chip focus-visible:focus-ring"
              aria-pressed={selectedTags.includes(tag)}
              onClick={() => onToggleTag(tag)}
              onFocus={scrollChipIntoRow}
            >
              {tagLabel(tag)}
            </button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          ref={moreRef}
          className="chip chip--more focus-visible:focus-ring"
          aria-expanded={moreOpen}
          aria-controls="pick-tags"
          onClick={() => setMoreOpen(!moreOpen)}
        >
          {moreOpen ? 'Less ▴' : 'More ▾'}
        </button>
      )}
    </div>
  )
}
