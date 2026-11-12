import '@testing-library/jest-dom'
import type { ReactNode } from 'react'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, authReducer, useAuthContext } from '../AuthContext'
import { useAuth } from '../../../hooks/useAuth'
import { useSignup } from '../../../pages/Admin/useSignup'
import { useSignedInUser } from '../../../pages/Checkout/account'
import {
  CHECK_EMAIL_ALREADY_EXISTS,
  GET_USER
} from '../../../lib/apollo/graphQL/queries'
import { fakeFirebase } from '../../../test/firebaseFake'
import { startFakeFirebase, stopFakeFirebase } from '../../../test/firebase'
import { logIn } from '../../../test/providers'

/* Firebase Auth: sign-in, sign-up and the session, with the in-memory Firebase. */

const profile = {
  __typename: 'User',
  _id: '65f000000000000000000001',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  numSavedRecipes: 0,
  pro: false
}
const me: MockedResponse = {
  request: { query: GET_USER },
  result: { data: { getUser: profile } }
}
const refused: MockedResponse = {
  request: { query: GET_USER },
  result: { errors: [{ message: 'Not logged in!' }] }
}
const freeEmail = (email: string): MockedResponse => ({
  request: { query: CHECK_EMAIL_ALREADY_EXISTS, variables: { email } },
  result: { data: { checkEmailAlreadyExists: false } }
})

const Where = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <p data-testid="where">{useLocation().pathname}</p>
  </>
)

const wrapper =
  (mocks: MockedResponse[]) =>
  ({ children }: { children: ReactNode }) =>
    (
      <MockedProvider mocks={mocks}>
        <MemoryRouter
          initialEntries={[{ pathname: '/login', state: { from: '/saved' } }]}
        >
          <AuthProvider>
            <Routes>
              <Route
                path="*"
                element={<Where>{children}</Where>}
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )

const useBoth = () => ({ auth: useAuth(), state: useAuthContext()[0] })

beforeEach(() => {
  localStorage.clear()
  startFakeFirebase()
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})
afterEach(stopFakeFirebase)

describe('authReducer with Firebase', () => {
  it('signs in, and on sign-out keeps only a valid legacy session', () => {
    const out = { profile: null, loggedIn: false }
    const signedIn = authReducer(out, { type: 'FIREBASE_IN', data: '' })
    expect(signedIn.loggedIn).toBe(true)
    expect(authReducer(signedIn, { type: 'FIREBASE_OUT', data: '' })).toEqual(
      out
    )
    logIn(false)
    expect(
      authReducer(signedIn, { type: 'FIREBASE_OUT', data: '' }).loggedIn
    ).toBe(true)
  })
})

describe('AuthProvider with Firebase', () => {
  it('signs in a restored session, and out when Firebase signs out', async () => {
    fakeFirebase.restoreSession('ada@example.com')
    const { result } = renderHook(useBoth, { wrapper: wrapper([]) })
    expect(result.current.state.loggedIn).toBe(true)
    act(() => result.current.auth.handleLogout())
    await waitFor(() => expect(fakeFirebase.auth.currentUser).toBeNull())
    expect(result.current.state.loggedIn).toBe(false)
  })
})

describe('useAuth with Firebase', () => {
  it('logs in with email and password once the API knows the user', async () => {
    fakeFirebase.addAccount('ada@example.com', 'correct horse')
    const { result } = renderHook(useBoth, { wrapper: wrapper([me]) })
    await act(() =>
      result.current.auth.login({
        email: 'ada@example.com',
        password: 'correct horse'
      })
    )
    expect(result.current.state.loggedIn).toBe(true)
    // back where the visitor came from
    expect(screen.getByTestId('where')).toHaveTextContent('/saved')
    expect(result.current.auth.loginError).toBe(false)
    expect(result.current.auth.loginLoading).toBe(false)
  })

  it('shows an error for a wrong password', async () => {
    const { result } = renderHook(useBoth, { wrapper: wrapper([]) })
    await act(() =>
      result.current.auth.login({ email: 'ada@example.com', password: 'x' })
    )
    expect(result.current.auth.loginError).toBe(true)
    expect(result.current.state.loggedIn).toBe(false)
  })

  it('signs out of Firebase again when the API refuses the account', async () => {
    fakeFirebase.setGoogleAccount('ada@example.com', 'Ada Lovelace')
    const { result } = renderHook(useBoth, { wrapper: wrapper([refused]) })
    await act(() => result.current.auth.loginWithGoogle())
    expect(result.current.auth.loginError).toBe(true)
    expect(fakeFirebase.auth.currentUser).toBeNull()
    expect(result.current.state.loggedIn).toBe(false)
  })

  it('logs in with Google', async () => {
    fakeFirebase.setGoogleAccount('ada@example.com', 'Ada Lovelace')
    const { result } = renderHook(useBoth, { wrapper: wrapper([me]) })
    await act(() => result.current.auth.loginWithGoogle())
    expect(result.current.state.loggedIn).toBe(true)
  })

  it('does nothing for Google while Firebase is off', async () => {
    stopFakeFirebase()
    const { result } = renderHook(useBoth, { wrapper: wrapper([]) })
    await act(() => result.current.auth.loginWithGoogle())
    expect(result.current.state.loggedIn).toBe(false)
    expect(result.current.auth.loginError).toBe(false)
  })
})

describe('useSignup with Firebase', () => {
  const fill = (
    signup: ReturnType<typeof useSignup>,
    email: string,
    password: string
  ) => {
    signup.onFirstNameChange({ target: { value: ' Ada ' } })
    signup.onLastNameChange({ target: { value: 'Lovelace' } })
    signup.onEmailChange({ target: { value: email } })
    signup.onPasswordChange({ target: { value: password } })
  }
  const submit = { preventDefault: () => undefined }

  it('makes the Firebase account with the name, then signs in', async () => {
    const { result } = renderHook(
      () => ({ signup: useSignup(), state: useAuthContext()[0] }),
      { wrapper: wrapper([freeEmail('ada@example.com'), me]) }
    )
    act(() => fill(result.current.signup, 'ada@example.com', 'correct horse'))
    let outcome: unknown
    await act(async () => {
      outcome = await result.current.signup.handleFormSubmit(submit)
    })
    expect(outcome).toEqual({ ok: true })
    expect(fakeFirebase.auth.currentUser?.displayName).toBe('Ada Lovelace')
    expect(result.current.state.loggedIn).toBe(true)
    expect(result.current.signup.addUserLoading).toBe(false)
  })

  it('says sign-up failed when Firebase refuses', async () => {
    fakeFirebase.addAccount('ada@example.com', 'someone else')
    const { result } = renderHook(useSignup, {
      wrapper: wrapper([freeEmail('ada@example.com')])
    })
    act(() => fill(result.current, 'ada@example.com', 'correct horse'))
    let outcome: unknown
    await act(async () => {
      outcome = await result.current.handleFormSubmit(submit)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'error',
      message: "Couldn't sign you up."
    })
    expect(result.current.validationMessage).toBe("Couldn't sign you up.")
  })
})

describe('useSignedInUser', () => {
  it('is nobody when signed out', () => {
    const { result } = renderHook(() => useSignedInUser(false), {
      wrapper: wrapper([])
    })
    expect(result.current).toBeNull()
  })

  it('reads a legacy session from its token', () => {
    logIn(false)
    const { result } = renderHook(() => useSignedInUser(true), {
      wrapper: wrapper([])
    })
    expect(result.current).toEqual({ id: 'u1', email: 'ada@example.com' })
  })

  it('asks the API for a Firebase user’s ingré id', async () => {
    const { result } = renderHook(() => useSignedInUser(true), {
      wrapper: wrapper([me])
    })
    expect(result.current).toBeNull()
    await waitFor(() =>
      expect(result.current).toEqual({
        id: profile._id,
        email: profile.email
      })
    )
  })
})
