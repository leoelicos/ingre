import { act, renderHook } from '@testing-library/react'
import { browserTimers } from '../usePendingTicks'
import { EMPTY_LIST } from '../useShoppingList'
import type { ListSnapshot } from '../useShoppingList'
import { UNDO_MS, useStartNewList } from '../useStartNewList'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

const full: ListSnapshot = {
  ...EMPTY_LIST,
  pickedIds: new Set(['dahl']),
  step: 'shop'
}

const newer: ListSnapshot = {
  ...EMPTY_LIST,
  pickedIds: new Set(['butter-chicken']),
  step: 'home'
}

const setup = (snapshot: () => ListSnapshot = () => full) => {
  const restored: ListSnapshot[] = []
  const hook = renderHook(() =>
    useStartNewList(
      { snapshot, restore: (s) => restored.push(s) },
      browserTimers
    )
  )
  return { restored, hook, now: () => hook.result.current }
}

describe('useStartNewList', () => {
  it('clears to the empty list and keeps Undo for 10s; a second start restarts it', () => {
    const { restored, now } = setup()
    act(() => now().start())
    expect(restored).toEqual([EMPTY_LIST])
    expect(now().canUndo).toBe(true)
    act(() => jest.advanceTimersByTime(UNDO_MS - 1))
    act(() => now().start())
    act(() => jest.advanceTimersByTime(UNDO_MS - 1))
    expect(now().canUndo).toBe(true)
    act(() => jest.advanceTimersByTime(1))
    expect(now().canUndo).toBe(false)
    expect(now().undo()).toBe('nothing-to-undo')
    expect(restored).toEqual([EMPTY_LIST, EMPTY_LIST])
  })

  it('undo restores the previous state and stops the clock', () => {
    const { restored, now } = setup()
    act(() => now().start())
    act(() => {
      expect(now().undo()).toBe('restored')
    })
    expect(restored).toEqual([EMPTY_LIST, full])
    expect(now().canUndo).toBe(false)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('undo is one-shot: a second Undo in a row restores nothing', () => {
    const { restored, now } = setup()
    act(() => now().start())
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
    const lists: ListSnapshot[] = [full, newer]
    const { restored, now } = setup(() => lists.shift() ?? EMPTY_LIST)
    act(() => now().start())
    const stale = now().undo
    act(() => {
      expect(stale()).toBe('restored')
    })
    act(() => now().start())
    act(() => {
      expect(now().undo()).toBe('restored')
    })
    act(() => {
      expect(stale()).toBe('nothing-to-undo')
    })
    expect(restored).toEqual([EMPTY_LIST, full, EMPTY_LIST, newer])
  })

  it('cancels its timer on unmount', () => {
    const { hook, now } = setup()
    act(() => now().start())
    hook.unmount()
    expect(jest.getTimerCount()).toBe(0)
    setup().hook.unmount()
  })
})
