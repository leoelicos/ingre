import { renderHook } from '@testing-library/react'
import { useSuccess } from '../useSuccess'

jest.mock('react-router-dom', () => ({
  useSearchParams: () => [{ get: () => 'session123' }],
  useNavigate: () => jest.fn()
}))

jest.mock('@apollo/client', () => ({
  useMutation: () => [jest.fn(), { loading: false }],
  gql: (s: TemplateStringsArray) => s
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: true }, jest.fn()]
}))

describe('useSuccess', () => {
  it('returns loggedIn and searchParams', () => {
    const { result } = renderHook(() => useSuccess())
    expect(result.current.loggedIn).toBe(true)
    expect(result.current.searchParams.get('session_id')).toBe('session123')
  })
})
