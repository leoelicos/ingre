import { renderHook, act } from '@testing-library/react'
import { useHome } from '../useHome'

const mockDispatch = jest.fn()

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [
    { loggedIn: true, profile: { data: { firstName: 'Test' } } },
    jest.fn()
  ]
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [
    { homeRecipes: [], homeDidMount: false },
    mockDispatch
  ]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

describe('useHome', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useHome())
    expect(result.current.loggedIn).toBe(true)
    expect(result.current.firstName).toBe('Test')
  })

  it('handleRefresh loads recipes from the local library', async () => {
    const { result } = renderHook(() => useHome())
    await act(async () => {
      await result.current.handleRefresh('vegetarian')
    })
    expect(result.current.loadingRecipes).toBe(false)
    expect(result.current.libraryRecipes.length).toBeGreaterThan(0)
  })
})
