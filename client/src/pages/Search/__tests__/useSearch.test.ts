import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../useSearch'

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ searchRecipes: [] }, jest.fn()]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('useSearch', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useSearch())
    expect(typeof result.current.searchText).toBe('string')
    expect(typeof result.current.handleFormSubmit).toBe('function')
    expect(typeof result.current.onSearchChange).toBe('function')
  })

  it('onSearchChange updates searchText', () => {
    const { result } = renderHook(() => useSearch())
    act(() => {
      result.current.onSearchChange({ target: { value: 'pasta' } })
    })
    expect(result.current.searchText).toBe('pasta')
  })

  it('searches the real local library', async () => {
    const { result } = renderHook(() => useSearch())
    await act(async () => {
      await result.current.handleFormSubmit('bolognese', { target: {} })
    })
    expect(result.current.libraryRecipes.map((r) => r.name)).toEqual([
      'Spaghetti bolognese'
    ])
  })
})
