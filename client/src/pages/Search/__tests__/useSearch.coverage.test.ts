import { renderHook, act } from '@testing-library/react'
import { buildFilterState, useSearch } from '../useSearch'

const mockDispatch = jest.fn()
const mockSearchLibrary = jest.fn()

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ searchRecipes: [] }, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))
jest.mock('../../../utils/library/recipeLibrary', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockSearchLibrary(...args)
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
    mockSearchLibrary.mockReset()
    mockSearchLibrary.mockReturnValue([{ name: 'Pasta' }])
  })

  it('returns early without an event and searches when one is provided', async () => {
    const { result } = renderHook(() => useSearch())
    await act(async () => {
      await result.current.handleFormSubmit('pasta')
    })
    expect(mockSearchLibrary).not.toHaveBeenCalled()

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
    expect(mockSearchLibrary).toHaveBeenCalledWith({
      q: 'pasta',
      tags: ['low-sodium']
    })
    expect(result.current.searchText).toBe('pasta')
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SEARCH_RECIPES',
      data: [{ name: 'Pasta' }]
    })
  })

  it('logs library failures and stops loading', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const { result } = renderHook(() => useSearch())
    mockSearchLibrary.mockImplementationOnce(() => {
      throw new Error('bad data')
    })
    await act(async () => {
      await result.current.handleFormSubmit('pasta', {
        target: { value: 'pasta' }
      })
    })
    expect(error).toHaveBeenCalled()
    expect(result.current.loadingRecipes).toBe(false)
    error.mockRestore()
  })
})
