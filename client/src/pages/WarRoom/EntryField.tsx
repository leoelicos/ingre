/*
 * The War room's field (t26u): a WAI-ARIA 1.2 combobox with a listbox of catalogue suggestions
 * for the part of the line being typed. Focus never leaves the field: the highlighted option is
 * aria-activedescendant, Enter adds, Tab completes, Esc closes then clears.
 */
import type { ClipboardEvent, FC, KeyboardEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useT } from '../../i18n'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { autofill, splitQuantity } from '../../utils/warroom/capture'
import {
  completed,
  isList,
  lineParts,
  listLines
} from '../../utils/warroom/entry'

export const FIELD_ID = 'war-room-field'
const LISTBOX_ID = 'war-room-suggestions'
const HELP_ID = 'war-room-field-help'

export const optionId = (item: LibraryIngredient): string =>
  `war-room-option-${item.id}`

export interface EntryFieldProps {
  readonly text: string
  readonly onText: (text: string) => void
  readonly placeholder: string
  /** Enter with nothing highlighted: everything typed */
  readonly onSubmit: (text: string) => void
  /** a suggestion chosen for the last part of the line */
  readonly onPick: (
    head: string,
    item: LibraryIngredient,
    quantity: number
  ) => void
  /** a pasted list, one item per line */
  readonly onList: (lines: string) => void
  /** Ctrl+Z or Cmd+Z in an empty field */
  readonly onUndo: (() => void) | null
  readonly isOnList: (id: string) => boolean
  /** a control after the field in the same row (voice) */
  readonly after?: ReactNode
}

const OPTION =
  'flex min-h-[44px] cursor-pointer items-center justify-between gap-2 rounded-control px-3 text-sm font-semibold text-text'

const step = (active: number, by: number, count: number): number =>
  active === -1 && by < 0 ? count - 1 : (active + by + count) % count

export const EntryField: FC<EntryFieldProps> = ({
  text,
  onText,
  placeholder,
  onSubmit,
  onPick,
  onList,
  onUndo,
  isOnList,
  after
}) => {
  const t = useT()
  const [active, setActive] = useState(-1)
  const [closed, setClosed] = useState(false)
  const { head, tail } = lineParts(text)
  const { quantity, term } = splitQuantity(tail)
  const options = autofill(term)
  const open = !closed && options.length > 0
  const highlighted = open ? options[active] : undefined
  const change = (next: string): void => {
    onText(next)
    setActive(-1)
    setClosed(false)
  }
  const pick = (item: LibraryIngredient): void => {
    setActive(-1)
    onPick(head, item, quantity)
  }
  const keys: Record<
    string,
    (event: KeyboardEvent<HTMLInputElement>) => boolean
  > = {
    ArrowDown: () => {
      if (options.length === 0) return false
      setClosed(false)
      setActive(open ? step(active, 1, options.length) : 0)
      return true
    },
    ArrowUp: () => {
      if (!open) return false
      setActive(step(active, -1, options.length))
      return true
    },
    Enter: () => {
      if (highlighted !== undefined) pick(highlighted)
      else if (text.trim() !== '') onSubmit(text)
      return true
    },
    Tab: (event) => {
      if (highlighted === undefined || event.shiftKey) return false
      change(completed(text, highlighted))
      return true
    },
    Escape: () => {
      if (open) setClosed(true)
      else if (text !== '') change('')
      else return false
      return true
    },
    z: (event) => {
      if (!(event.ctrlKey || event.metaKey) || text !== '' || onUndo === null)
        return false
      onUndo()
      return true
    }
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const handle = keys[event.key]
    if (handle !== undefined && handle(event)) event.preventDefault()
  }
  const onPaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    const pasted = event.clipboardData.getData('text')
    if (!isList(pasted)) return
    event.preventDefault()
    onList(
      [text, listLines(pasted)].filter((part) => part.trim() !== '').join('\n')
    )
  }
  const count =
    term === ''
      ? ''
      : options.length === 0
      ? t('warRoomEntry.noSuggestions')
      : t('warRoomEntry.suggestionCount', { count: options.length })
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label
            htmlFor={FIELD_ID}
            className="sr-only"
          >
            {t('warRoom.field')}
          </label>
          <input
            id={FIELD_ID}
            role="combobox"
            aria-expanded={open}
            aria-controls={LISTBOX_ID}
            aria-autocomplete="list"
            aria-activedescendant={
              highlighted === undefined ? undefined : optionId(highlighted)
            }
            aria-describedby={HELP_ID}
            autoFocus
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            value={text}
            placeholder={placeholder}
            onChange={(event) => change(event.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onBlur={() => setActive(-1)}
            className="min-h-[44px] w-full rounded-control border border-border bg-surface px-3 text-base text-text placeholder:text-placeholder focus-visible:focus-ring"
          />
        </div>
        {after}
      </div>
      <p
        id={HELP_ID}
        className="m-0 text-sm text-text-secondary"
      >
        {t('warRoom.hint')}
      </p>
      <div
        aria-live="polite"
        className="sr-only"
      >
        {count}
      </div>
      <ul
        id={LISTBOX_ID}
        role="listbox"
        aria-label={t('warRoom.matches')}
        hidden={!open}
        className="m-0 flex list-none flex-col gap-1 rounded-control bg-surface p-1 shadow-raised"
      >
        {options.map((item, i) => (
          /* the field keeps focus and handles the keys (aria-activedescendant); a tap picks */
          <li
            key={item.id}
            id={optionId(item)}
            role="option"
            aria-selected={i === active}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(item)}
            className={`${OPTION} ${
              i === active
                ? 'bg-chip-active outline outline-2 outline-primary'
                : 'bg-bg'
            }`}
          >
            <span>{capitaliseFirst(item.name)}</span>
            {isOnList(item.id) && (
              <span className="text-xs font-normal text-text-secondary">
                {t('warRoomEntry.onList')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
