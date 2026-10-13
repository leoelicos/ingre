import { renderHook, act } from '@testing-library/react'
import { buildFilterState, useSearch } from '../useSearch'

const mockDispatch = jest.fn()
const mockQuery = jest.fn()
const mockFetchEdamam = jest.fn()

jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({
    query: (...args: unknown[]) => mockQuery(...args)
  }),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ searchRecipes: [] }, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))
jest.mock('../../../utils/api/edamam', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockFetchEdamam(...args)
}))

describe('buildFilterState', () => {
  it('keeps known filter values and ignores everything else', () => {
    expect(buildFilterState(null)).toEqual({
      diet: [],
      health: [],
      cuisineType: [],
      mealType: [],
      dishType: []
    })
    expect(buildFilterState(['diet'])).toEqual({
      diet: [],
      health: [],
      cuisineType: [],
      mealType: [],
      dishType: []
    })
    expect(buildFilterState('diet')).toEqual({
      diet: [],
      health: [],
      cuisineType: [],
      mealType: [],
      dishType: []
    })
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
    ).toEqual({
      diet: [],
      health: [],
      cuisineType: [],
      mealType: [],
      dishType: []
    })
  })
})

describe('useSearch coverage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockQuery.mockReset()
    mockFetchEdamam.mockReset()
    mockQuery.mockResolvedValue({
      data: { getApiKey: { appId: 'id', appKey: 'key' } }
    })
    mockFetchEdamam.mockResolvedValue([{ name: 'Pasta' }])
  })

  it('returns early without an event and searches when one is provided', async () => {
    const { result } = renderHook(() => useSearch())
    await act(async () => {
      await result.current.handleFormSubmit('pasta')
    })
    expect(mockQuery).not.toHaveBeenCalled()

    act(() => {
      result.current.onSearchChange({ target: { value: 'pasta' } })
      result.current.handleFilterChange({
        target: { value: { diet: 'low-sodium' } }
      })
    })
    await act(async () => {
      await result.current.handleFormSubmit('pasta', {
        target: { value: 'pasta' }
      })
    })
    expect(mockFetchEdamam).toHaveBeenCalledWith({
      search: {
        diet: ['low-sodium'],
        health: [],
        cuisineType: [],
        mealType: [],
        dishType: [],
        q: 'pasta'
      },
      appId: 'id',
      appKey: 'key'
    })
    expect(result.current.searchText).toBe('pasta')
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SEARCH_RECIPES',
      data: [{ name: 'Pasta' }]
    })
  })

  it('logs credential and network failures', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const { result } = renderHook(() => useSearch())
    mockQuery.mockResolvedValueOnce(null)
    await act(async () => {
      await result.current.handleFormSubmit('pasta', {
        target: { value: 'pasta' }
      })
    })
    mockQuery.mockRejectedValueOnce(new Error('down'))
    await act(async () => {
      await result.current.handleFormSubmit('pasta', {
        target: { value: 'pasta' }
      })
    })
    mockFetchEdamam.mockRejectedValueOnce(new Error('edamam'))
    await act(async () => {
      await result.current.handleFormSubmit('pasta', {
        target: { value: 'pasta' }
      })
    })
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
