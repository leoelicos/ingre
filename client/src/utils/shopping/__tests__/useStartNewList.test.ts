import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { browserTimers } from '../usePendingTicks'
import { EMPTY_LIST, NO_UNSAVED } from '../useShoppingList'
import type { ListSnapshot } from '../useShoppingList'
import { UNDO_MS, stillCleared, useStartNewList } from '../useStartNewList'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

const full: ListSnapshot = {
  pickedIds: new Set(['dahl']),
  haveIds: new Set(['onion']),
  basketIds: new Set(['garlic']),
  extras: [{ id: 'free-x', name: 'x', ingredientId: null, quantity: 2 }],
  step: 'shop'
}

const newer: ListSnapshot = {
  ...EMPTY_LIST,
  pickedIds: new Set(['butter-chicken']),
  step: 'home'
}

/** A real list in React state: restore really replaces it, and every change re-renders the hook. */
const setup = (initial: ListSnapshot = full) => {
  const restored: ListSnapshot[] = []
  const hook = renderHook(() => {
    const [current, setCurrent] = useState(initial)
    const startNew = useStartNewList(
      {
        snapshot: () => current,
        restore: (s) => {
          restored.push(s)
          setCurrent(s)
        }
      },
      browserTimers
    )
    return { current, setCurrent, ...startNew }
  })
  const now = () => hook.result.current
  const change = (next: Partial<ListSnapshot>) =>
    act(() => now().setCurrent((previous) => ({ ...previous, ...next })))
  return { restored, hook, now, change }
}

describe('useStartNewList', () => {
  it('clears to the empty list and keeps Undo for 10s; a second start restarts it', () => {
    const { restored, now } = setup()
    act(() => now().start(NO_UNSAVED))
    expect(restored).toEqual([EMPTY_LIST])
    expect(now().canUndo).toBe(true)
    act(() => jest.advanceTimersByTime(UNDO_MS - 1))
    act(() => now().start(NO_UNSAVED))
    act(() => jest.advanceTimersByTime(UNDO_MS - 1))
    expect(now().canUndo).toBe(true)
    act(() => jest.advanceTimersByTime(1))
    expect(now().canUndo).toBe(false)
    expect(now().undo()).toBe('nothing-to-undo')
    expect(restored).toEqual([EMPTY_LIST, EMPTY_LIST])
  })

  it('undo restores the previous state and stops the clock', () => {
    const { restored, now } = setup()
    act(() => now().start(NO_UNSAVED))
    act(() => {
      expect(now().undo()).toBe('restored')
    })
    expect(restored).toEqual([EMPTY_LIST, full])
    expect(now().current).toEqual(full)
    expect(now().canUndo).toBe(false)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('undo restores ticks still waiting on the tick clock, saved as the clock would save them', () => {
    const { now } = setup()
    act(() => now().start({ haveIds: ['egg'], basketIds: ['milk'] }))
    act(() => {
      expect(now().undo()).toBe('restored')
    })
    expect(now().current).toEqual({
      ...full,
      haveIds: new Set(['onion', 'egg']),
      basketIds: new Set(['garlic', 'milk'])
    })
  })

  it('undo is one-shot: a second Undo in a row restores nothing', () => {
    const { restored, now } = setup()
    act(() => now().start(NO_UNSAVED))
    const { undo } = now()
    act(() => {
      expect(undo()).toBe('restored')
      expect(undo()).toBe('nothing-to-undo')
    })
    expect(restored).toEqual([EMPTY_LIST, full])
    expect(now().undo()).toBe('nothing-to-undo')
    expect(now().canUndo).toBe(false)
  })

  it('a stale Undo can never restore an older snapshot over a newer list', () => {
    const { restored, now, change } = setup()
    act(() => now().start(NO_UNSAVED))
    const stale = now().undo
    act(() => {
      expect(stale()).toBe('restored')
    })
    change(newer)
    act(() => now().start(NO_UNSAVED))
    act(() => {
      expect(now().undo()).toBe('restored')
    })
    act(() => {
      expect(stale()).toBe('nothing-to-undo')
    })
    expect(restored).toEqual([EMPTY_LIST, full, EMPTY_LIST, newer])
  })

  it.each<[string, Partial<ListSnapshot>]>([
    ['a pick', { pickedIds: new Set(['butter-chicken']) }],
    ['a tick at home', { haveIds: new Set(['egg']) }],
    ['a tick at the shop', { basketIds: new Set(['egg']) }],
    [
      'a new item',
      { extras: [{ id: 'free-y', name: 'y', ingredientId: null, quantity: 1 }] }
    ],
    ['a step change', { step: 'home' }]
  ])(
    'a list change after clearing (%s) drops the Undo and the snapshot for good',
    (_, next) => {
      const { restored, now, change } = setup()
      act(() => now().start(NO_UNSAVED))
      const stale = now().undo
      change(next)
      expect(now().canUndo).toBe(false)
      expect(jest.getTimerCount()).toBe(0)
      // changing it back to empty does not bring the old list back either
      change(EMPTY_LIST)
      expect(now().canUndo).toBe(false)
      act(() => {
        expect(stale()).toBe('nothing-to-undo')
        expect(now().undo()).toBe('nothing-to-undo')
      })
      expect(restored).toEqual([EMPTY_LIST])
    }
  )

  it('stillCleared is true only for the empty list, item for item', () => {
    expect(stillCleared(EMPTY_LIST)).toBe(true)
    expect(stillCleared({ ...EMPTY_LIST, haveIds: new Set() })).toBe(true)
    expect(stillCleared(full)).toBe(false)
    const one = { id: 'free-x', name: 'x', ingredientId: null, quantity: 1 }
    const listWith = (extras: ListSnapshot['extras']) =>
      stillCleared({ ...EMPTY_LIST, extras })
    expect(listWith([one])).toBe(false)
    expect(listWith([])).toBe(true)
  })

  it('pause stops the countdown while focus is in the note; resume starts a fresh 10s', () => {
    const { restored, now } = setup()
    act(() => now().start(NO_UNSAVED))
    act(() => jest.advanceTimersByTime(UNDO_MS - 1))
    act(() => now().pause())
    expect(jest.getTimerCount()).toBe(0)
    act(() => jest.advanceTimersByTime(UNDO_MS * 5))
    expect(now().canUndo).toBe(true)
    act(() => now().resume())
    act(() => jest.advanceTimersByTime(UNDO_MS - 1))
    expect(now().canUndo).toBe(true)
    act(() => jest.advanceTimersByTime(1))
    expect(now().canUndo).toBe(false)
    expect(now().undo()).toBe('nothing-to-undo')
    expect(restored).toEqual([EMPTY_LIST])
  })

  it('resume does nothing once there is nothing to undo', () => {
    const { now } = setup()
    act(() => now().resume())
    expect(jest.getTimerCount()).toBe(0)
    act(() => now().start(NO_UNSAVED))
    act(() => {
      expect(now().undo()).toBe('restored')
    })
    act(() => now().resume())
    expect(jest.getTimerCount()).toBe(0)
    expect(now().canUndo).toBe(false)
  })

  it('cancels its timer on unmount', () => {
    const { hook, now } = setup()
    act(() => now().start(NO_UNSAVED))
    hook.unmount()
    expect(jest.getTimerCount()).toBe(0)
    setup().hook.unmount()
  })
})
