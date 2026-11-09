import type { HistoryEntry } from '../history'
import {
  byDay,
  dayStart,
  frequentItemIds,
  HISTORY_CAP,
  newEntries,
  parseHistory,
  recentItemIds,
  withEntries,
  withoutIds
} from '../history'

/* t26u history: newest first, capped, in days, with recent and frequent items. */

const at = (iso: string) => new Date(iso).getTime()
const entry = (
  id: string,
  itemId: string,
  when: string,
  quantity = 1
): HistoryEntry => ({ id, itemId, quantity, at: at(when) })

describe('parseHistory', () => {
  it('keeps good entries, drops malformed ones, and refuses what is not a list', () => {
    const good = entry('a', 'carrot', '2026-11-10T09:00:00')
    expect(
      parseHistory([
        good,
        null,
        'carrot',
        { ...good, id: 1 },
        { ...good, itemId: 2 },
        { ...good, quantity: '2' },
        { ...good, quantity: 0 },
        { ...good, at: 'now' }
      ])
    ).toEqual([good])
    expect(parseHistory({})).toBeNull()
  })

  it('never reads back more than the cap', () => {
    const many = Array.from({ length: HISTORY_CAP + 5 }, (_, i) =>
      entry(`e${i}`, 'carrot', '2026-11-10T09:00:00')
    )
    expect(parseHistory(many)).toHaveLength(HISTORY_CAP)
  })
})

describe('adding and removing', () => {
  it('makes unique entries, the first added at the bottom', () => {
    const when = at('2026-11-10T09:00:00')
    const made = newEntries(
      [
        { itemId: 'carrot', quantity: 3 },
        { itemId: 'onion', quantity: 1 }
      ],
      when
    )
    expect(made.map(({ itemId }) => itemId)).toEqual(['onion', 'carrot'])
    expect(made[1]).toMatchObject({ quantity: 3, at: when })
    expect(new Set(made.map(({ id }) => id)).size).toBe(2)
    const again = newEntries([{ itemId: 'carrot', quantity: 3 }], when)
    expect(again[0]?.id).not.toBe(made[1]?.id)
  })

  it('puts new entries on top and drops the oldest past the cap', () => {
    const old = Array.from({ length: HISTORY_CAP }, (_, i) =>
      entry(`old${i}`, 'carrot', '2026-11-09T09:00:00')
    )
    const next = withEntries(old, [
      entry('new', 'onion', '2026-11-10T09:00:00')
    ])
    expect(next).toHaveLength(HISTORY_CAP)
    expect(next[0]?.id).toBe('new')
    expect(next.some(({ id }) => id === `old${HISTORY_CAP - 1}`)).toBe(false)
  })

  it('takes out entries by id', () => {
    const a = entry('a', 'carrot', '2026-11-10T09:00:00')
    const b = entry('b', 'onion', '2026-11-10T09:00:00')
    expect(withoutIds([a, b], new Set(['a']))).toEqual([b])
  })
})

describe('recent and frequent', () => {
  const history = [
    entry('1', 'garlic', '2026-11-10T10:00:00'),
    entry('2', 'carrot', '2026-11-10T09:00:00'),
    entry('3', 'garlic', '2026-11-09T09:00:00'),
    entry('4', 'onion', '2026-11-08T09:00:00'),
    entry('5', 'carrot', '2026-11-07T09:00:00'),
    entry('6', 'carrot', '2026-11-06T09:00:00'),
    entry('7', 'egg', '2026-11-05T09:00:00')
  ]

  it('recent: each item once, newest first, up to the limit', () => {
    expect(recentItemIds(history, 3)).toEqual(['garlic', 'carrot', 'onion'])
  })

  it('frequent: added more than once, most often first, the more recent on a tie', () => {
    expect(frequentItemIds(history, 5)).toEqual(['carrot', 'garlic'])
    expect(frequentItemIds(history, 1)).toEqual(['carrot'])
    expect(
      frequentItemIds(
        [
          entry('1', 'garlic', '2026-11-10T10:00:00'),
          entry('2', 'carrot', '2026-11-10T09:00:00'),
          entry('3', 'carrot', '2026-11-10T08:00:00'),
          entry('4', 'garlic', '2026-11-10T07:00:00')
        ],
        5
      )
    ).toEqual(['garlic', 'carrot'])
  })
})

describe('byDay', () => {
  it('groups newest-first entries into local days with how long ago they were', () => {
    const now = at('2026-11-10T12:00:00')
    const days = byDay(
      [
        entry('a', 'carrot', '2026-11-10T09:00:00'),
        entry('b', 'onion', '2026-11-10T00:00:00'),
        entry('c', 'garlic', '2026-11-09T23:59:00'),
        entry('d', 'egg', '2026-11-06T08:00:00')
      ],
      now
    )
    expect(days.map(({ daysAgo }) => daysAgo)).toEqual([0, 1, 4])
    expect(days[0]?.entries.map(({ id }) => id)).toEqual(['a', 'b'])
    expect(days[0]?.day).toBe(dayStart(now))
    expect(byDay([], now)).toEqual([])
  })
})
