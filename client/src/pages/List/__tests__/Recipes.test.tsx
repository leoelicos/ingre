import { act, renderHook } from '@testing-library/react'
import { recipeById } from '../../../test/library'
import { CARD_SWIPE, ROW_SWIPE } from '../../../utils/gestures/swipe'
import { useChips } from '../../../utils/chips/useChips'
import { swipeRule, useRemoval } from '../Recipes'

beforeEach(() => localStorage.clear())

describe('Feature: Swipe-to-delete in Recipes (#192)', () => {
  it('cards swipe up on mobile, rows swipe left from 576px', () => {
    expect(swipeRule(false)).toBe(CARD_SWIPE)
    expect(swipeRule(true)).toBe(ROW_SWIPE)
  })

  it('a recipe that is not on the list leaves no note', () => {
    const { result } = renderHook(() => useRemoval(useChips()))
    act(() => result.current.remove(recipeById('dahl')))
    expect(result.current.removed).toBeNull()
  })
})
