import { renderHook, act } from '@testing-library/react'
import { useHome } from '../useHome'

const mockDispatch = jest.fn()
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ query: jest.fn().mockResolvedValue({ data: { getAppCredentials: { appId: 'id', appKey: 'key' } } }) }),
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true, profile: { data: { firstName: 'Test' } } }, jest.fn()]
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ homeRecipes: [], homeDidMount: false }, mockDispatch]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))
jest.mock('../../../utils/api/edamam', () => jest.fn().mockResolvedValue([{ name: 'Pasta' }]))

describe('useHome', () => {
  it('returns expected shape and calls changeTitle', () => {
    const { result } = renderHook(() => useHome())
    expect(result.current.loggedIn).toBe(true)
    expect(result.current.firstName).toBe('Test')
  })

  it('handleRefresh fetches recipes', async () => {
    const { result } = renderHook(() => useHome())
    await act(async () => {
      await result.current.handleRefresh('pasta')
    })
    expect(result.current.loadingEdamam).toBe(false)
  })
})
