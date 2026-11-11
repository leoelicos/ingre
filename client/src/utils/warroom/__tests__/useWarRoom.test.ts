import { act, renderHook } from '@testing-library/react'
import { ALL_TILES } from '../rank'
import { SETTLE_MS, useWarRoom } from '../useWarRoom'

beforeEach(() => localStorage.clear())

it('minus on something not on the list does nothing', () => {
  const { result } = renderHook(() => useWarRoom({ likely: 24, slots: 4 }))
  const banana = ALL_TILES.find((tile) => tile.id === 'banana')
  if (banana === undefined) throw new Error('no banana')
  act(() => result.current.minus(banana))
  expect(result.current.quantityOf(banana)).toBe(0)
  expect(result.current.said).toBe('')
})

it('pads what goes with the list when it is not enough to fill the slots', () => {
  jest.useFakeTimers()
  const { result } = renderHook(() => useWarRoom({ likely: 0, slots: 500 }))
  const mince = ALL_TILES.find((tile) => tile.id === 'beef-mince')
  if (mince === undefined) throw new Error('no beef mince')
  act(() => result.current.tap(mince))
  act(() => jest.advanceTimersByTime(SETTLE_MS))
  const types = new Set(result.current.suggestions.map((s) => s.reason.type))
  jest.useRealTimers()
  expect(types.has('with')).toBe(true)
  expect(types.has('try')).toBe(true)
})
