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

const setup = () => {
  const restored: ListSnapshot[] = []
  const hook = renderHook(() =>
    useStartNewList(
      { snapshot: () => full, restore: (s) => restored.push(s) },
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
    expect(now().previous).toBe(full)
    act(() => jest.advanceTimersByTime(UNDO_MS - 1))
    act(() => now().start())
    act(() => jest.advanceTimersByTime(UNDO_MS - 1))
    expect(now().previous).toBe(full)
    act(() => jest.advanceTimersByTime(1))
    expect(now().previous).toBeNull()
  })

  it('undo restores the previous state and stops the clock', () => {
    const { restored, now } = setup()
    act(() => now().start())
    act(() => now().undo(full))
    expect(restored).toEqual([EMPTY_LIST, full])
    expect(now().previous).toBeNull()
    expect(jest.getTimerCount()).toBe(0)
  })

  it('cancels its timer on unmount', () => {
    const { hook, now } = setup()
    act(() => now().start())
    hook.unmount()
    expect(jest.getTimerCount()).toBe(0)
    setup().hook.unmount()
  })
})
