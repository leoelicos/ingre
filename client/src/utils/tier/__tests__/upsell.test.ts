import { act, renderHook } from '@testing-library/react'
import {
  FIRST_END_TO_END_KEY,
  isEndToEnd,
  markFirstEndToEnd,
  readFirstEndToEnd,
  showUpsell,
  useFirstEndToEnd,
  useMarkFirstEndToEnd
} from '../upsell'

const chip = (crossed: boolean, greyed = false) => ({ crossed, greyed })

describe('first end-to-end (#208)', () => {
  beforeEach(() => localStorage.clear())

  it('is a picked recipe and every chip crossed off', () => {
    expect(isEndToEnd([chip(true), chip(true)], 1)).toBe(true)
  })

  it('not while a chip is still to buy', () => {
    expect(isEndToEnd([chip(true), chip(false)], 1)).toBe(false)
  })

  it('ignores greyed chips, which cannot be crossed off', () => {
    expect(isEndToEnd([chip(true), chip(false, true)], 1)).toBe(true)
    expect(isEndToEnd([chip(false, true)], 1)).toBe(false)
  })

  it('not with nothing picked or an empty list', () => {
    expect(isEndToEnd([chip(true)], 0)).toBe(false)
    expect(isEndToEnd([], 1)).toBe(false)
  })

  it('is remembered on the device', () => {
    expect(readFirstEndToEnd()).toBe(false)
    markFirstEndToEnd()
    expect(readFirstEndToEnd()).toBe(true)
    expect(localStorage.getItem(FIRST_END_TO_END_KEY)).toBe('true')
  })

  it('a bad stored value reads as not done', () => {
    localStorage.setItem(FIRST_END_TO_END_KEY, '"yes"')
    expect(readFirstEndToEnd()).toBe(false)
  })
})

describe('showUpsell', () => {
  it('only with the flag on, after the first end-to-end, inside the account menu or Plans', () => {
    expect(showUpsell({ flag: true, firstEndToEnd: true })).toBe(true)
    expect(showUpsell({ flag: false, firstEndToEnd: true })).toBe(false)
    expect(showUpsell({ flag: true, firstEndToEnd: false })).toBe(false)
    expect(showUpsell({ flag: false, firstEndToEnd: false })).toBe(false)
  })
})

describe('useMarkFirstEndToEnd', () => {
  beforeEach(() => localStorage.clear())

  it('remembers the first end-to-end, and every user of it updates', () => {
    const seen = renderHook(() => useFirstEndToEnd())
    expect(seen.result.current).toBe(false)
    renderHook(() => useMarkFirstEndToEnd(true, [chip(true)], 1))
    expect(seen.result.current).toBe(true)
    expect(readFirstEndToEnd()).toBe(true)
    seen.unmount()
  })

  it('stays quiet with the flag off or the list unfinished', () => {
    renderHook(() => useMarkFirstEndToEnd(false, [chip(true)], 1))
    renderHook(() => useMarkFirstEndToEnd(true, [chip(false)], 1))
    expect(readFirstEndToEnd()).toBe(false)
  })

  it('does not write again once it is remembered', () => {
    markFirstEndToEnd()
    const write = jest.spyOn(Storage.prototype, 'setItem')
    act(() => {
      renderHook(() => useMarkFirstEndToEnd(true, [chip(true)], 1))
    })
    expect(write).not.toHaveBeenCalled()
    write.mockRestore()
  })
})
