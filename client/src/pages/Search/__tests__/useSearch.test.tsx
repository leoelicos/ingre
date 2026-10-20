import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import type { ClientRecipe } from '../../../types/client'
import { recipe } from '../../../test/fixtures'
import {
  StoreProvider,
  useStoreContext
} from '../../../utils/state/GlobalState'
import { buildFilterState, useSearch } from '../useSearch'

const wrapper = ({ children }: { children: ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
)

/** useSearch plus the store it writes to. */
const useSearchAndStore = (search?: Parameters<typeof useSearch>[0]) => ({
  search: useSearch(search),
  store: useStoreContext()[0]
})

const empty = {
  diet: [],
  health: [],
  cuisineType: [],
  mealType: [],
  dishType: []
}

describe('buildFilterState', () => {
  it('keeps known filter values and ignores everything else', () => {
    expect(buildFilterState(null)).toEqual(empty)
    expect(buildFilterState(['diet'])).toEqual(empty)
    expect(buildFilterState('diet')).toEqual(empty)
    expect(
      buildFilterState({
        diet: 'balanced',
        health: 'vegan',
        'cuisine-type': 'Italian',
        'meal-type': 'Dinner',
        'dish-type': 'Soup',
        other: 'ignored',
        dietExtra: 1
      })
    ).toEqual({
      diet: ['balanced'],
      health: ['vegan'],
      cuisineType: ['Italian'],
      mealType: ['Dinner'],
      dishType: ['Soup']
    })
    expect(
      buildFilterState({
        diet: 'not-a-diet',
        health: 'not-health',
        'cuisine-type': 'Atlantis',
        'meal-type': 'Brunch',
        'dish-type': 'Cake'
      })
    ).toEqual(empty)
  })
})

describe('useSearch', () => {
  it('updates the search text', () => {
    const { result } = renderHook(() => useSearch(), { wrapper })
    act(() => {
      result.current.onSearchChange({ target: { value: 'pasta' } })
    })
    expect(result.current.searchText).toBe('pasta')
  })

  it('searches the real local library and stores the hits', async () => {
    const { result } = renderHook(() => useSearchAndStore(), { wrapper })
    await act(async () => {
      await result.current.search.handleFormSubmit('bolognese', { target: {} })
    })
    const names = (rs: readonly ClientRecipe[]) => rs.map((r) => r.name)
    expect(names(result.current.search.libraryRecipes)).toEqual([
      'Spaghetti bolognese'
    ])
    expect(names(result.current.store.searchRecipes)).toEqual([
      'Spaghetti bolognese'
    ])
  })

  it('does nothing without an event, and passes the chosen filters as tags', async () => {
    const seen: unknown[] = []
    const search = (query: { q: string; tags: string[] }) => {
      seen.push(query)
      return [recipe({ name: 'Pasta' })]
    }
    const { result } = renderHook(() => useSearch(search), { wrapper })
    await act(async () => {
      await result.current.handleFormSubmit('pasta')
    })
    expect(seen).toEqual([])
    act(() => {
      result.current.handleFilterChange({
        target: { value: { diet: 'low-sodium' } }
      })
    })
    await act(async () => {
      await result.current.handleFormSubmit('pasta', { target: {} })
    })
    expect(seen).toEqual([{ q: 'pasta', tags: ['low-sodium'] }])
  })

  it('logs a library failure and stops loading', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const broken = (): ClientRecipe[] => {
      throw new Error('bad data')
    }
    const { result } = renderHook(() => useSearch(broken), { wrapper })
    await act(async () => {
      await result.current.handleFormSubmit('pasta', { target: {} })
    })
    expect(error).toHaveBeenCalled()
    expect(result.current.loadingRecipes).toBe(false)
    error.mockRestore()
  })
})
