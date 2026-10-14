import { dragOffset, stepAt, swipeTarget } from '../swipe'

describe('swipeTarget', () => {
  it('changes step only past 40% of the width', () => {
    expect(swipeTarget(1, -39, 100, 3)).toBe(1)
    expect(swipeTarget(1, -41, 100, 3)).toBe(2)
    expect(swipeTarget(1, 41, 100, 3)).toBe(0)
  })
  it('clamps at the ends and ignores zero width', () => {
    expect(swipeTarget(0, 90, 100, 3)).toBe(0)
    expect(swipeTarget(2, -90, 100, 3)).toBe(2)
    expect(swipeTarget(1, -90, 0, 3)).toBe(1)
  })
})

describe('dragOffset', () => {
  it('resists past the first and last step', () => {
    expect(dragOffset(0, 30, 3)).toBe(10)
    expect(dragOffset(2, -30, 3)).toBe(-10)
    expect(dragOffset(1, 30, 3)).toBe(30)
    expect(dragOffset(0, -30, 3)).toBe(-30)
  })
})

describe('stepAt', () => {
  it('returns the step or the fallback', () => {
    expect(stepAt(1, 'pick')).toBe('home')
    expect(stepAt(9, 'pick')).toBe('pick')
  })
})
