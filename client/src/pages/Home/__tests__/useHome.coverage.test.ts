import { renderHook, act } from '@testing-library/react'
import { useHome } from '../useHome'

const mockDispatch = jest.fn()
const mockQuery = jest.fn()
const mockFetchEdamam = jest.fn()
const mockAuth: {
  loggedIn: boolean
  profile: { data: { firstName: string } } | null
} = { loggedIn: true, profile: { data: { firstName: 'Test' } } }
const mockStore: { homeRecipes: never[]; homeDidMount: boolean } = {
  homeRecipes: [],
  homeDidMount: true
}

jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({
    query: (...args: unknown[]) => mockQuery(...args)
  }),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [mockAuth, jest.fn()]
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [mockStore, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))
jest.mock('../../../utils/api/edamam', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockFetchEdamam(...args)
}))

describe('useHome coverage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockQuery.mockReset()
    mockFetchEdamam.mockReset()
    mockQuery.mockResolvedValue({
      data: { getApiKey: { appId: 'id', appKey: 'key' } }
    })
    mockFetchEdamam.mockResolvedValue([])
    mockAuth.loggedIn = true
    mockAuth.profile = { data: { firstName: 'Test' } }
    mockStore.homeDidMount = true
  })

  it('uses the profile name and falls back to chef', () => {
    const { result, rerender } = renderHook(() => useHome())
    expect(result.current.firstName).toBe('Test')
    expect(result.current.loggedIn).toBe(true)
    mockAuth.profile = null
    mockAuth.loggedIn = false
    rerender()
    expect(result.current.firstName).toBe('chef')
    mockAuth.profile = { data: { firstName: '' } }
    rerender()
    expect(result.current.firstName).toBe('chef')
  })

  it('refreshes every preset query and stores the hits', async () => {
    const { result } = renderHook(() => useHome())
    for (const query of [
      'vegetarian',
      'vegan',
      'balanced',
      'breakfast',
      'lunch',
      'dinner',
      'yum'
    ]) {
      await act(async () => {
        await result.current.handleRefresh(query)
      })
    }
    expect(mockFetchEdamam).toHaveBeenCalledWith({
      search: { health: ['vegetarian'] },
      appId: 'id',
      appKey: 'key'
    })
    expect(mockFetchEdamam).toHaveBeenCalledWith({
      search: { q: 'yum' },
      appId: 'id',
      appKey: 'key'
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_HOME_RECIPES',
      data: []
    })
    expect(result.current.loadingEdamam).toBe(false)
  })

  it('logs and stops loading when credentials are missing or the query throws', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockStore.homeDidMount = true
    const { result } = renderHook(() => useHome())
    mockQuery.mockResolvedValueOnce(null)
    await act(async () => {
      await result.current.handleRefresh('vegetarian')
    })
    mockQuery.mockRejectedValueOnce(new Error('down'))
    await act(async () => {
      await result.current.handleRefresh('vegan')
    })
    expect(result.current.loadingEdamam).toBe(false)
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('fetches on first mount and logs a failed first load', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockStore.homeDidMount = false
    await act(async () => {
      renderHook(() => useHome())
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FLAG_HOME_MOUNTED',
      data: undefined
    })
    expect(mockFetchEdamam).toHaveBeenCalledWith({
      search: {},
      appId: 'id',
      appKey: 'key'
    })

    mockFetchEdamam.mockClear()
    mockQuery.mockRejectedValue(new Error('down'))
    mockStore.homeDidMount = false
    await act(async () => {
      renderHook(() => useHome())
    })
    expect(mockFetchEdamam).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
