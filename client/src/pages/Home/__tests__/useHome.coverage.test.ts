import { renderHook, act } from '@testing-library/react'
import { useHome } from '../useHome'

const mockDispatch = jest.fn()
const mockSearchLibrary = jest.fn()
const mockAuth: {
  loggedIn: boolean
  profile: { data: { firstName: string } } | null
} = { loggedIn: true, profile: { data: { firstName: 'Test' } } }
const mockStore: { homeRecipes: never[]; homeDidMount: boolean } = {
  homeRecipes: [],
  homeDidMount: true
}

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [mockAuth, jest.fn()]
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [mockStore, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))
jest.mock('../../../utils/library/recipeLibrary', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockSearchLibrary(...args)
}))

describe('useHome coverage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockSearchLibrary.mockReset()
    mockSearchLibrary.mockReturnValue([])
    mockAuth.loggedIn = true
    mockAuth.profile = { data: { firstName: 'Test' } }
    mockStore.homeDidMount = true
  })

  it('uses the profile name and falls back to chef', () => {
    const { result, rerender } = renderHook(() => useHome())
    expect(result.current.firstName).toBe('Test')
    mockAuth.profile = null
    mockAuth.loggedIn = false
    rerender()
    expect(result.current.firstName).toBe('chef')
    mockAuth.profile = { data: { firstName: '' } }
    rerender()
    expect(result.current.firstName).toBe('chef')
  })

  it('maps preset queries to tags and stores the hits', async () => {
    const { result } = renderHook(() => useHome())
    for (const query of ['vegetarian', 'dinner', 'balanced', 'yum']) {
      await act(async () => {
        await result.current.handleRefresh(query)
      })
    }
    expect(mockSearchLibrary).toHaveBeenCalledWith({ tags: ['vegetarian'] })
    expect(mockSearchLibrary).toHaveBeenCalledWith({ tags: ['dinner'] })
    expect(mockSearchLibrary).toHaveBeenCalledWith({ tags: [] })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_HOME_RECIPES',
      data: []
    })
    expect(result.current.loadingRecipes).toBe(false)
  })

  it('logs and stops loading when the library search throws', async () => {
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const { result } = renderHook(() => useHome())
    mockSearchLibrary.mockImplementationOnce(() => {
      throw new Error('bad data')
    })
    await act(async () => {
      await result.current.handleRefresh('vegan')
    })
    expect(result.current.loadingRecipes).toBe(false)
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('loads on first mount and logs a failed first load', async () => {
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
    expect(mockSearchLibrary).toHaveBeenCalledWith({})

    mockSearchLibrary.mockImplementationOnce(() => {
      throw new Error('bad data')
    })
    mockStore.homeDidMount = false
    await act(async () => {
      renderHook(() => useHome())
    })
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
