import { isSwipeRight, SWIPE_MIN } from '../swipe'

describe('isSwipeRight (#229)', () => {
  const from = { x: 100, y: 100 }

  it('is a swipe when it goes far enough right and mostly sideways', () => {
    expect(isSwipeRight(from, { x: 100 + SWIPE_MIN, y: 100 })).toBe(true)
    expect(isSwipeRight(from, { x: 200, y: 130 })).toBe(true)
  })

  it('is not a swipe when it is too short', () => {
    expect(isSwipeRight(from, { x: 100 + SWIPE_MIN - 1, y: 100 })).toBe(false)
  })

  it('is not a swipe to the left', () => {
    expect(isSwipeRight(from, { x: 0, y: 100 })).toBe(false)
  })

  it('is not a swipe when it is mostly up or down (a scroll)', () => {
    expect(isSwipeRight(from, { x: 170, y: 220 })).toBe(false)
    expect(isSwipeRight(from, { x: 170, y: 20 })).toBe(false)
  })
})
