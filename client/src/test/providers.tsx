import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'
import { render } from '@testing-library/react'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuthContext } from '../utils/auth/AuthContext'
import { StoreProvider } from '../utils/state/GlobalState'

/** An hour from now, in JWT seconds. */
const inAnHour = () => Math.floor(Date.now() / 1000) + 3600

/** An unsigned JWT the client can decode (it never checks the signature). */
export const testToken = (pro: boolean, exp: number = inAnHour()): string => {
  const payload = Buffer.from(
    JSON.stringify({
      exp,
      data: { firstName: 'Ada', email: 'ada@example.com', _id: 'u1', pro }
    })
  ).toString('base64url')
  return `e30.${payload}.sig`
}

/** Stores a token as a logged-in visitor would have it. */
export const logIn = (pro: boolean): void => {
  localStorage.setItem('id_token', testToken(pro))
}

/** Loads the decoded profile from the stored token, as the real 'UPDATE' action does. */
export const ProfileFromToken: FC = () => {
  const [, dispatch] = useAuthContext()
  useEffect(() => {
    dispatch({ type: 'UPDATE', data: '' })
  }, [dispatch])
  return null
}

/** Shows the current path, so a test can assert where the app navigated. */
export const LocationProbe: FC = () => {
  const { pathname, search } = useLocation()
  return <p data-testid="location">{`${pathname}${search}`}</p>
}

interface Options {
  mocks: readonly MockedResponse[]
  path: string
  /** Extra routes beside the one under test, e.g. where it navigates to. */
  routes: Readonly<Record<string, ReactNode>>
}

/** Renders `ui` at `path` inside the real Apollo (mocked network), router, auth and store providers. */
export const renderWithProviders = (
  ui: ReactNode,
  { mocks, path, routes }: Options
) =>
  render(
    <MockedProvider mocks={[...mocks]}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <StoreProvider>
            <Routes>
              <Route
                path={new URL(path, 'http://localhost').pathname}
                element={ui}
              />
              {Object.entries(routes).map(([to, element]) => (
                <Route
                  key={to}
                  path={to}
                  element={element}
                />
              ))}
            </Routes>
            <LocationProbe />
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )
