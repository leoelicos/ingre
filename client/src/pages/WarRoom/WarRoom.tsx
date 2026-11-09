import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Button } from 'react-aria-components'
import { Link } from 'react-router-dom'
import { translate, useT } from '../../i18n'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { changeTitle } from '../../utils/changeTitle'
import { focusById, focusFirstOf } from '../../utils/focus'
import { useChips } from '../../utils/chips/useChips'
import { catalogue } from '../../utils/library/recipeLibrary'
import { useVoice } from '../../utils/voice/speech'
import type { Capture } from '../../utils/warroom/capture'
import { captureOf } from '../../utils/warroom/capture'
import type { HistoryEntry } from '../../utils/warroom/history'
import {
  byDay,
  frequentItemIds,
  recentItemIds
} from '../../utils/warroom/history'
import { nextPrompt } from '../../utils/warroom/prompts'
import { useHistory } from '../../utils/warroom/useHistory'
import { EntryField, FIELD_ID } from './EntryField'
import type { Shown } from './History'
import { againId, HISTORY_HEADING_ID, History, removeId } from './History'
import { promptKeys, QuickChips } from './QuickChips'

const NAMES = (items: readonly LibraryIngredient[]): string =>
  items.map(({ name }) => capitaliseFirst(name)).join(', ')

const COMMAND =
  'inline-flex min-h-[44px] items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-on-primary data-[focus-visible]:focus-ring data-[pressed]:shadow-pressed'

const UNDO =
  'inline-flex min-h-[44px] items-center justify-center rounded-pill border-2 border-current px-4 text-sm font-semibold text-primary data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

/** History entries on show at first, and how many more each Show more adds. */
export const HISTORY_PAGE = 30

/** Chips per row of one-tap adds: a thumb's reach, not a catalogue. */
const QUICK = 6

/** The same ingredient said twice in one go counts once. */
const distinct = (captures: readonly Capture[]): Capture[] =>
  captures.filter(
    (capture, i) =>
      capture.item === null ||
      captures.findIndex((other) => other.item?.id === capture.item?.id) === i
  )

/** One sentence of acknowledgement: what went on, what was there already, what was not understood. */
const sentence = (
  added: readonly LibraryIngredient[],
  already: readonly LibraryIngredient[],
  unmatched: readonly string[]
): string =>
  [
    added.length > 0 ? translate('warRoom.added', { names: NAMES(added) }) : '',
    already.length > 0
      ? translate('warRoom.already', { names: NAMES(already) })
      : '',
    unmatched.length > 0
      ? translate('warRoom.noMatch', { terms: unmatched.join(', ') })
      : ''
  ]
    .filter((part) => part !== '')
    .join('. ')

/** The last add, so Undo can take exactly that off again. */
interface Batch {
  readonly items: readonly LibraryIngredient[]
  readonly entryIds: ReadonlySet<string>
}

const byId = new Map(catalogue.map((item) => [item.id, item]))

/** Catalogue items for ids, skipping any the catalogue no longer has. */
const itemsOf = (ids: readonly string[]): LibraryIngredient[] =>
  ids.flatMap((id) => {
    const item = byId.get(id)
    return item === undefined ? [] : [item]
  })

const shownOf = (entries: readonly HistoryEntry[]): Shown[] =>
  entries.flatMap((entry) => {
    const item = byId.get(entry.itemId)
    return item === undefined ? [] : [{ entry, item }]
  })

/** True when a key press is meant for a field, not for a page shortcut. */
const typing = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/** "/" from anywhere on the page goes to the field. */
const useSlashToType = (): void =>
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        typing(event.target)
      )
        return
      event.preventDefault()
      focusById(FIELD_ID)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

const SHORTCUTS = ['enter', 'arrows', 'tab', 'escape', 'undo', 'slash'] as const

const Shortcuts: FC = () => {
  const t = useT()
  return (
    <details className="text-sm">
      <summary className="flex min-h-[44px] cursor-pointer items-center font-semibold text-primary focus-visible:focus-ring">
        {t('warRoomEntry.shortcutsHeading')}
      </summary>
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {SHORTCUTS.map((key) => (
          <div
            key={key}
            className="contents"
          >
            <dt className="font-semibold">
              <kbd className="font-sans">
                {t(`warRoomEntry.shortcuts.${key}.keys`)}
              </kbd>
            </dt>
            <dd className="m-0 text-text-secondary">
              {t(`warRoomEntry.shortcuts.${key}.does`)}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

/**
 * The War room (#207, t26u): a bare, fast capture list for the pre-shop sprint. Type, paste or
 * say what you need; every match goes straight onto the shopping list with an inline
 * acknowledgement and an Undo, and the field is ready for the next one at once. Suggestions
 * follow the part being typed; recent and frequent adds are one tap; history is kept on device.
 */
export const WarRoom: FC = () => {
  const t = useT()
  useEffect(() => changeTitle(translate('warRoom.title')), [])
  useSlashToType()
  const list = useChips()
  const history = useHistory()
  const [text, setText] = useState('')
  const [ack, setAck] = useState('')
  const [undo, setUndo] = useState<Batch | null>(null)
  const [example, setExample] = useState(0)
  const [visible, setVisible] = useState(HISTORY_PAGE)
  const take = (all: readonly Capture[]): void => {
    const found = distinct(all)
    const known = found.flatMap(({ item, quantity }) =>
      item === null ? [] : [{ item, quantity }]
    )
    const present = known.filter(({ item }) => list.hasChip(item.id))
    const fresh = known.filter(({ item }) => !list.hasChip(item.id))
    fresh.forEach(({ item, quantity }) => {
      list.addExtra(item)
      if (quantity > 1) list.setExtra(item.id, quantity)
    })
    const logged = history.add(
      fresh.map(({ item, quantity }) => ({ itemId: item.id, quantity }))
    )
    setUndo(
      fresh.length === 0
        ? null
        : {
            items: fresh.map(({ item }) => item),
            entryIds: new Set(logged.map(({ id }) => id))
          }
    )
    if (fresh.length > 0) setExample(nextPrompt)
    setAck(
      sentence(
        fresh.map(({ item }) => item),
        present.map(({ item }) => item),
        found.flatMap(({ item, term }) => (item === null ? [term] : []))
      )
    )
    setText('')
  }
  const voice = useVoice((heard) => take(captureOf(heard)))
  /* a tap on a suggestion or chip gives focus back to the field, ready for the next one (not after voice) */
  const pick = (head: string, item: LibraryIngredient, count: number): void => {
    take([...captureOf(head), { item, quantity: count, term: item.name }])
    focusById(FIELD_ID)
  }
  const undoLast = (batch: Batch): void => {
    batch.items.forEach((item) => list.removeExtra(item.id))
    history.remove(batch.entryIds)
    setUndo(null)
    setAck(translate('warRoomEntry.undone', { names: NAMES(batch.items) }))
    focusById(FIELD_ID)
  }
  const all = shownOf(history.entries)
  const shown = all.slice(0, visible)
  const days = byDay(
    shown.map(({ entry }) => entry),
    Date.now()
  ).map(({ entries, ...day }) => ({ ...day, shown: shownOf(entries) }))
  const showMore = (): void => {
    const first = all.slice(visible, visible + 1).map((s) => againId(s.entry))
    setVisible((before) => before + HISTORY_PAGE)
    setTimeout(() => focusFirstOf(first))
  }
  const offList = (items: readonly LibraryIngredient[]): LibraryIngredient[] =>
    items.filter((item) => !list.hasChip(item.id))
  const recent = offList(
    itemsOf(recentItemIds(history.entries, QUICK * 2))
  ).slice(0, QUICK)
  const recentIds = new Set(recent.map(({ id }) => id))
  const frequent = offList(itemsOf(frequentItemIds(history.entries, QUICK * 3)))
    .filter(({ id }) => !recentIds.has(id))
    .slice(0, QUICK)
  const remove = ({ entry, item }: Shown): void => {
    const at = all.findIndex((s) => s.entry.id === entry.id)
    const next = [all[at + 1], all[at - 1]].flatMap((s) =>
      s === undefined ? [] : [removeId(s.entry)]
    )
    history.remove(new Set([entry.id]))
    setAck(
      translate('warRoomEntry.removed', { name: capitaliseFirst(item.name) })
    )
    setTimeout(() => focusFirstOf([...next, HISTORY_HEADING_ID]))
  }
  const exampleText = t(
    `warRoomEntry.prompts.${promptKeys(example, 1).join('')}`
  )
  return (
    <div className="mx-auto flex w-full max-w-layout flex-col gap-3 px-gutter pb-24 pt-4">
      <h1 className="m-0 text-xl font-bold">{t('warRoom.title')}</h1>
      <EntryField
        text={text}
        onText={setText}
        placeholder={t('warRoomEntry.placeholder', { example: exampleText })}
        onSubmit={(line) => take(captureOf(line))}
        onPick={pick}
        onList={(lines) => take(captureOf(lines))}
        onUndo={undo === null ? null : () => undoLast(undo)}
        isOnList={list.hasChip}
        after={
          voice.toggle !== null && (
            <Button
              onPress={voice.toggle}
              aria-pressed={voice.listening}
              className={`${COMMAND} aria-pressed:bg-accent`}
            >
              {t(voice.listening ? 'warRoom.stop' : 'warRoom.speak')}
            </Button>
          )
        }
      />
      <div className="flex min-h-[44px] flex-wrap items-center gap-2">
        <p
          role="status"
          className="m-0 min-h-[1.25rem] flex-1 text-sm font-semibold text-text"
        >
          {ack}
        </p>
        {undo !== null && (
          <Button
            aria-label={t('warRoomEntry.undoLabel', {
              names: NAMES(undo.items)
            })}
            onPress={() => undoLast(undo)}
            className={UNDO}
          >
            {t('warRoomEntry.undo')}
          </Button>
        )}
      </div>
      {text === '' && (
        <QuickChips
          recent={recent}
          frequent={frequent}
          firstTime={history.entries.length === 0}
          example={example}
          onAdd={(item) => pick('', item, 1)}
          onTry={(line) => {
            setText(line)
            focusById(FIELD_ID)
          }}
        />
      )}
      <History
        days={days}
        onAgain={({ entry, item }) => {
          pick('', item, entry.quantity)
        }}
        onRemove={remove}
        more={all.length - shown.length}
        onMore={showMore}
        onClear={() => {
          history.clear()
          setUndo(null)
          setAck(translate('warRoomEntry.cleared'))
          focusById(FIELD_ID)
        }}
      />
      <Shortcuts />
      <Link
        to="/"
        className="inline-flex min-h-[44px] items-center self-start rounded-control px-2 text-sm font-semibold text-primary focus-visible:focus-ring"
      >
        {t('warRoom.back')}
      </Link>
    </div>
  )
}
