/*
 * The War room's history (t26u): everything added, newest first, in days. A tap on an entry
 * adds it again; each entry can go, or all of them after a question.
 */
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Button } from 'react-aria-components'
import { formatClock, formatDayName, useT } from '../../i18n'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { focusById } from '../../utils/focus'
import type { HistoryDay, HistoryEntry } from '../../utils/warroom/history'
import { CHIP } from './QuickChips'

export const HISTORY_HEADING_ID = 'war-room-history'
export const CLEAR_ID = 'war-room-clear'
const CLEAR_NO_ID = 'war-room-clear-no'

export const againId = (entry: HistoryEntry): string =>
  `war-room-again-${entry.id}`
export const removeId = (entry: HistoryEntry): string =>
  `war-room-remove-${entry.id}`

const ICON_BUTTON =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-lg text-text-secondary data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

const COMMAND =
  'inline-flex min-h-[44px] items-center justify-center rounded-pill border-2 border-current px-4 text-sm font-semibold data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

export interface Shown {
  readonly entry: HistoryEntry
  readonly item: LibraryIngredient
}

const ClearQuestion: FC<{ onYes: () => void; onNo: () => void }> = ({
  onYes,
  onNo
}) => {
  const t = useT()
  /* the safe answer has focus, so a second Enter keeps the history */
  useEffect(() => {
    const timer = setTimeout(() => focusById(CLEAR_NO_ID))
    return () => clearTimeout(timer)
  }, [])
  return (
    <div
      role="group"
      aria-label={t('warRoomEntry.clearQuestion')}
      className="flex flex-wrap items-center gap-2 rounded-control border-2 border-primary p-2"
    >
      <p className="m-0 flex-1 text-sm font-semibold">
        {t('warRoomEntry.clearQuestion')}
      </p>
      <Button
        onPress={onYes}
        className={COMMAND}
      >
        {t('warRoomEntry.clearYes')}
      </Button>
      <Button
        id={CLEAR_NO_ID}
        onPress={onNo}
        className={COMMAND}
      >
        {t('warRoomEntry.clearNo')}
      </Button>
    </div>
  )
}

const dayHeading = (
  day: Pick<HistoryDay, 'day' | 'daysAgo'>,
  t: (key: string) => string
): string =>
  day.daysAgo === 0
    ? t('warRoomEntry.today')
    : day.daysAgo === 1
    ? t('warRoomEntry.yesterday')
    : formatDayName(day.day)

export const History: FC<{
  days: readonly (Omit<HistoryDay, 'entries'> & { shown: readonly Shown[] })[]
  onAgain: (shown: Shown) => void
  onRemove: (shown: Shown) => void
  onClear: () => void
  /** entries not on show yet */
  more: number
  onMore: () => void
}> = ({ days, onAgain, onRemove, onClear, more, onMore }) => {
  const t = useT()
  const [asking, setAsking] = useState(false)
  return (
    <section
      aria-labelledby={HISTORY_HEADING_ID}
      className="flex flex-col gap-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id={HISTORY_HEADING_ID}
          tabIndex={-1}
          className="m-0 text-base font-bold"
        >
          {t('warRoomEntry.history')}
        </h2>
        {days.length > 0 && !asking && (
          <Button
            id={CLEAR_ID}
            onPress={() => setAsking(true)}
            className={COMMAND}
          >
            {t('warRoomEntry.clear')}
          </Button>
        )}
      </div>
      {asking && (
        <ClearQuestion
          onYes={() => {
            setAsking(false)
            onClear()
          }}
          onNo={() => {
            setAsking(false)
            setTimeout(() => focusById(CLEAR_ID))
          }}
        />
      )}
      {days.length === 0 && (
        <p className="m-0 text-sm text-text-secondary">
          {t('warRoomEntry.historyEmpty')}
        </p>
      )}
      {days.map((day) => {
        const headingId = `war-room-day-${day.day}`
        return (
          <section
            key={day.day}
            aria-labelledby={headingId}
            className="flex flex-col gap-1"
          >
            <h3
              id={headingId}
              className="m-0 text-sm font-semibold uppercase tracking-wide text-text-secondary"
            >
              {dayHeading(day, t)}
            </h3>
            <ul className="m-0 flex list-none flex-col p-0">
              {day.shown.map((shown) => {
                const { entry, item } = shown
                const time = formatClock(entry.at)
                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-2 border-b border-border py-1"
                  >
                    <Button
                      id={againId(entry)}
                      aria-label={t('warRoomEntry.addAgain', {
                        name:
                          entry.quantity > 1
                            ? `${item.name} ×${entry.quantity}`
                            : item.name
                      })}
                      onPress={() => onAgain(shown)}
                      className={`${CHIP} min-w-0 flex-1 justify-start shadow-none`}
                    >
                      <span className="truncate">
                        {capitaliseFirst(item.name)}
                        {entry.quantity > 1 && (
                          <span className="tabular-nums text-text-secondary">{` ×${entry.quantity}`}</span>
                        )}
                      </span>
                    </Button>
                    <time
                      dateTime={new Date(entry.at).toISOString()}
                      className="shrink-0 text-xs tabular-nums text-text-secondary"
                    >
                      {time}
                    </time>
                    <Button
                      id={removeId(entry)}
                      aria-label={t('warRoomEntry.removeEntry', {
                        name: item.name,
                        time
                      })}
                      onPress={() => onRemove(shown)}
                      className={ICON_BUTTON}
                    >
                      <span aria-hidden="true">×</span>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      {more > 0 && (
        <Button
          onPress={onMore}
          className={`${COMMAND} self-start`}
        >
          {t('warRoomEntry.showMore', { count: more })}
        </Button>
      )}
    </section>
  )
}
