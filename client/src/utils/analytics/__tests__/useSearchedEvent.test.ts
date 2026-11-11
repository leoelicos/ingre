import { act, renderHook } from '@testing-library/react'
import { readEvents } from '../events'
import {
  SEARCH_SETTLE_MS,
  isNewSearch,
  searchedText,
  useSearchedEvent
} from '../useSearchedEvent'

/* #222: ingredient_searched is logged when the text settles. */

const MATCHES = { ingredients: 2, recipes: 1 }
const settle = () => act(() => void jest.advanceTimersByTime(SEARCH_SETTLE_MS))
const searches = () => readEvents().map(({ name, props }) => ({ name, props }))

beforeEach(() => {
  localStorage.clear()
  jest.useFakeTimers()
})
afterEach(() => jest.useRealTimers())

describe('helpers', () => {
  it('trims the text and keeps one space between words', () => {
    expect(searchedText('  red   lentil ')).toBe('red lentil')
  })

  it('counts only changed, non-blank text as a new search', () => {
    expect(isNewSearch('dahl', '')).toBe(true)
    expect(isNewSearch('dahl', 'dahl')).toBe(false)
    expect(isNewSearch('', 'dahl')).toBe(false)
  })
})

describe('useSearchedEvent', () => {
  it('logs once, after the text has sat still, with what it matched', () => {
    const { rerender } = renderHook(
      ({ query }) => useSearchedEvent(query, MATCHES),
      { initialProps: { query: '' } }
    )
    rerender({ query: 'd' })
    act(() => void jest.advanceTimersByTime(SEARCH_SETTLE_MS - 1))
    rerender({ query: 'dahl' })
    act(() => void jest.advanceTimersByTime(SEARCH_SETTLE_MS - 1))
    expect(searches()).toEqual([])
    act(() => void jest.advanceTimersByTime(1))
    expect(searches()).toEqual([
      {
        name: 'ingredient_searched',
        props: { query: 'dahl', ingredients: 2, recipes: 1 }
      }
    ])
  })

  it('does not log blank text or the same text twice in a row', () => {
    const { rerender } = renderHook(
      ({ query }) => useSearchedEvent(query, MATCHES),
      { initialProps: { query: '   ' } }
    )
    settle()
    rerender({ query: 'dahl' })
    settle()
    rerender({ query: 'dahl ' })
    settle()
    expect(searches()).toHaveLength(1)
    rerender({ query: '' })
    settle()
    rerender({ query: 'dahl' })
    settle()
    expect(searches()).toHaveLength(2)
  })

  it('logs the counts that were showing when the text settled', () => {
    const { rerender } = renderHook(
      ({ query, matches }) => useSearchedEvent(query, matches),
      {
        initialProps: { query: 'oni', matches: { ingredients: 0, recipes: 0 } }
      }
    )
    rerender({ query: 'oni', matches: { ingredients: 3, recipes: 4 } })
    settle()
    expect(readEvents()[0]?.props).toEqual({
      query: 'oni',
      ingredients: 3,
      recipes: 4
    })
  })
})
