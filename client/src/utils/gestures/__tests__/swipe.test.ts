import {
  CARD_SWIPE,
  ROW_SWIPE,
  SHEET_SWIPE,
  across,
  along,
  dragOffset,
  dragTransform,
  hasMoved,
  isSwipe,
  onAxis
} from '../swipe'

const at = (x: number, y: number) => ({ x, y })
const from = at(100, 100)

describe('Feature: Swipe rules (#192)', () => {
  it('measures along the rule’s direction, and across it either way', () => {
    expect(along(from, at(100, 40), CARD_SWIPE)).toBe(60)
    expect(along(from, at(100, 140), CARD_SWIPE)).toBe(-40)
    expect(along(from, at(20, 100), ROW_SWIPE)).toBe(80)
    expect(along(from, at(100, 150), SHEET_SWIPE)).toBe(50)
    expect(across(from, at(70, 40), CARD_SWIPE)).toBe(30)
    expect(across(from, at(20, 130), ROW_SWIPE)).toBe(30)
  })

  it('is on the axis only when it went twice as far along as across', () => {
    expect(onAxis(from, at(100, 0), CARD_SWIPE)).toBe(true)
    expect(onAxis(from, at(150, 0), CARD_SWIPE)).toBe(false)
    expect(onAxis(from, at(149, 0), CARD_SWIPE)).toBe(true)
  })

  it('swipes at the threshold, the right way, on the axis', () => {
    expect(isSwipe(from, at(100, 4), CARD_SWIPE)).toBe(true)
    expect(isSwipe(from, at(100, 5), CARD_SWIPE)).toBe(false)
    expect(isSwipe(from, at(100, 196), CARD_SWIPE)).toBe(false)
    expect(isSwipe(from, at(-20, 100), ROW_SWIPE)).toBe(true)
    expect(isSwipe(from, at(-20, 0), ROW_SWIPE)).toBe(false)
    expect(isSwipe(from, at(100, 196), SHEET_SWIPE)).toBe(true)
  })

  it('drags only forwards and only on the axis', () => {
    expect(dragOffset(from, at(100, 70), CARD_SWIPE)).toBe(30)
    expect(dragOffset(from, at(100, 130), CARD_SWIPE)).toBe(0)
    expect(dragOffset(from, at(200, 70), CARD_SWIPE)).toBe(0)
  })

  it('is a drag past the slop, a press within it', () => {
    expect(hasMoved(from, at(106, 108))).toBe(false)
    expect(hasMoved(from, at(107, 108))).toBe(true)
  })

  it('turns an offset into a transform in the rule’s direction', () => {
    expect(dragTransform(CARD_SWIPE, 0)).toBe('')
    expect(dragTransform(CARD_SWIPE, 30)).toBe('translateY(-30px)')
    expect(dragTransform(ROW_SWIPE, 30)).toBe('translateX(-30px)')
    expect(dragTransform(SHEET_SWIPE, 30)).toBe('translateY(30px)')
  })
})
