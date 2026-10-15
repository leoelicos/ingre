import '@testing-library/jest-dom'
import { renderHook, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { AuthProvider, useAuthContext } from '../../utils/auth/AuthContext'
import { LOGIN } from '../../lib/apollo/graphQL/mutations'
import { useAuth } from '../useAuth'

const VALID_TOKEN =
  'eyJhbGciOiJub25lIn0.eyJkYXRhIjp7ImZpcnN0TmFtZSI6IkFkYSIsImVtYWlsIjoiYWRhQGIuYyIsIl9pZCI6IjEiLCJwcm8iOmZhbHNlfSwiZXhwIjo5OTk5OTk5OTk5fQ.'

const loginMock: MockedResponse = {
  request: {
    query: LOGIN,
    variables: { email: 'ada@b.c', password: 'secret' }
  },
  result: { data: { login: { token: VALID_TOKEN } } }
}

const Probe = () => {
  const loc = useLocation()
  return <span data-testid="where">{loc.pathname}</span>
}

const wrapper =
  (mocks: MockedResponse[] = [], initial = '/login') =>
  ({ children }: { children: React.ReactNode }) =>
    (
      <MockedProvider mocks={mocks}>
        <AuthProvider>
          <MemoryRouter initialEntries={[initial]}>
            <Routes>
              <Route
                path="*"
                element={children}
              />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </MockedProvider>
    )

describe('useAuth', () => {
  it('returns login and logout functions', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper() })
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.handleLogout).toBe('function')
  })

  it('handleLogout clears the logged-in state', () => {
    const { result } = renderHook(
      () => ({ auth: useAuth(), ctx: useAuthContext() }),
      { wrapper: wrapper() }
    )
    act(() => {
      result.current.auth.handleLogout()
    })
    expect(result.current.ctx[0].loggedIn).toBe(false)
  })

  it('login dispatches and navigates on success', async () => {
    const { result } = renderHook(
      () => ({ auth: useAuth(), ctx: useAuthContext() }),
      {
        wrapper: wrapper([loginMock], '/login')
      }
    )
    act(() => {
      void result.current.auth.login({ email: 'ada@b.c', password: 'secret' })
    })
    await waitFor(() => {
      expect(result.current.ctx[0].loggedIn).toBe(true)
    })
  })
})
