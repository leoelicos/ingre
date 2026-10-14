import { act, renderHook } from '@testing-library/react'
import {
  FADE_MS,
  REDUCED_MOTION_QUERY,
  TICK_DELAY_MS,
  browserTimers,
  instantTicks,
  useDelayedTicks
} from '../usePendingTicks'

/** A store-like committed set so the hook can be driven end to end. */
const setup = () => {
  const committed = { ids: new Set<string>(), commits: [] as string[][] }
  const hook = renderHook(() =>
    useDelayedTicks(
      committed.ids,
      (ids) => {
        committed.commits.push([...ids])
        committed.ids = new Set([...committed.ids, ...ids])
      },
      (id) => {
        committed.ids = new Set([...committed.ids].filter((x) => x !== id))
      },
      'In basket',
      browserTimers
    )
  )
  return { committed, hook, now: () => hook.result.current }
}
const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms))

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('useDelayedTicks', () => {
  it('ticks at once, stays pending, then fades and moves together', () => {
    const { committed, now } = setup()
    act(() => now().onToggle('a'))
    expect(now().checkedIds.has('a')).toBe(true)
    expect(now().pendingIds.has('a')).toBe(true)
    expect(now().pendingLabel).toBe('In basket')
    wait(TICK_DELAY_MS - 1)
    act(() => now().onToggle('b'))
    wait(TICK_DELAY_MS - 1)
    expect(committed.commits).toEqual([])
    wait(1)
    expect([...now().leavingIds]).toEqual(['a', 'b'])
    expect(now().pendingIds.size).toBe(0)
    expect(now().checkedIds.has('a')).toBe(true)
    wait(FADE_MS)
    expect(committed.commits).toEqual([['a', 'b']])
    expect(now().leavingIds.size).toBe(0)
  })

  it('fires exactly 2000ms after the last tick despite re-renders and pointer events', () => {
    const { committed, hook, now } = setup()
    act(() => now().onToggle('a'))
    for (let i = 0; i < 19; i += 1) {
      wait(100)
      hook.rerender()
      document.body.dispatchEvent(new Event('pointermove', { bubbles: true }))
      document.body.dispatchEvent(new Event('mouseover', { bubbles: true }))
      document.body.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    }
    wait(99)
    expect([...now().pendingIds]).toEqual(['a'])
    wait(1)
    expect([...now().leavingIds]).toEqual(['a'])
    wait(FADE_MS)
    expect(committed.commits).toEqual([['a']])
  })

  it('undoes one without resetting the clock or cancelling others', () => {
    const { committed, now } = setup()
    act(() => now().onToggle('a'))
    wait(1000)
    act(() => now().onToggle('b'))
    wait(500)
    act(() => now().onUndo('a'))
    wait(TICK_DELAY_MS - 500 + FADE_MS)
    expect(committed.commits).toEqual([['b']])
  })

  it('undo before the move means nothing moves; ticking a pending row undoes it', () => {
    const { committed, now } = setup()
    act(() => now().onToggle('a'))
    act(() => now().onToggle('a'))
    expect(now().checkedIds.has('a')).toBe(false)
    wait(TICK_DELAY_MS + FADE_MS)
    expect(committed.commits).toEqual([])
  })

  it('after the move, unticking is immediate', () => {
    const { committed, hook, now } = setup()
    act(() => now().onToggle('a'))
    wait(TICK_DELAY_MS + FADE_MS)
    hook.rerender()
    expect(now().movedIds.has('a')).toBe(true)
    act(() => now().onToggle('a'))
    expect(committed.ids.has('a')).toBe(false)
  })

  it('commits anything still pending on unmount', () => {
    const { committed, hook, now } = setup()
    act(() => now().onToggle('a'))
    hook.unmount()
    expect(committed.commits).toEqual([['a']])
    const quiet = setup()
    quiet.hook.unmount()
    expect(quiet.committed.commits).toEqual([])
  })

  it('cuts instantly under prefers-reduced-motion, keeping the pause', () => {
    const original = window.matchMedia
    window.matchMedia = (query: string) => {
      const list = new EventTarget()
      return Object.assign(list, {
        matches: query === REDUCED_MOTION_QUERY,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {}
      })
    }
    const { committed, now } = setup()
    act(() => now().onToggle('a'))
    wait(TICK_DELAY_MS - 1)
    expect(committed.commits).toEqual([])
    wait(1)
    expect(committed.commits).toEqual([['a']])
    expect(now().leavingIds.size).toBe(0)
    window.matchMedia = original
  })
})

describe('instantTicks', () => {
  it('treats checked ids as moved and undo as a toggle', () => {
    const toggled: string[] = []
    const ticks = instantTicks(new Set(['a']), (id) => toggled.push(id))
    expect(ticks.movedIds.has('a')).toBe(true)
    ticks.onUndo('a')
    expect(toggled).toEqual(['a'])
  })
})
