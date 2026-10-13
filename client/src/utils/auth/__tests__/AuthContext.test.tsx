import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, authReducer, readInitialAuth, useAuthContext } from '../AuthContext'

function token(exp: number) {
  const payload = Buffer.from(
    JSON.stringify({
      exp,
      data: { firstName: 'Ada', email: 'a@b.c', _id: '1', pro: true }
    })
  ).toString('base64url')
  return `e30.${payload}.sig`
}

function Probe() {
  const [state, dispatch] = useAuthContext()
  return (
    <button
      onClick={() => dispatch({ type: 'LOGOUT', data: '' })}
    >
      {state.loggedIn ? 'in' : 'out'}
    </button>
  )
}

describe('readInitialAuth', () => {
  const future = Math.floor(Date.now() / 1000) + 3600

  it('is logged out without a token or with an expired token', () => {
    expect(readInitialAuth(null).loggedIn).toBe(false)
    expect(readInitialAuth(token(1)).loggedIn).toBe(false)
  })

  it('is logged in with a valid token', () => {
    expect(readInitialAuth(token(future)).loggedIn).toBe(true)
  })
})

describe('authReducer', () => {
  const loggedOut = { profile: null, loggedIn: false }

  beforeEach(() => {
    localStorage.clear()
  })

  it('logs in, refreshes a valid token, and logs out', () => {
    const fresh = token(Math.floor(Date.now() / 1000) + 3600)
    const loggedIn = authReducer(loggedOut, { type: 'LOGIN', data: fresh })
    expect(loggedIn.loggedIn).toBe(true)
    expect(loggedIn.profile?.data.firstName).toBe('Ada')
    expect(localStorage.getItem('id_token')).toBe(fresh)

    expect(authReducer(loggedIn, { type: 'UPDATE', data: '' }).loggedIn).toBe(true)

    const loggedBackOut = authReducer(loggedIn, { type: 'LOGOUT', data: '' })
    expect(loggedBackOut).toEqual({ profile: null, loggedIn: false })
    expect(localStorage.getItem('id_token')).toBeNull()
  })

  it('update logs out when the token is missing or expired', () => {
    expect(authReducer(loggedOut, { type: 'UPDATE', data: '' }).loggedIn).toBe(false)

    localStorage.setItem('id_token', token(1))
    const cleared = authReducer(
      { profile: null, loggedIn: true },
      { type: 'UPDATE', data: '' }
    )
    expect(cleared.loggedIn).toBe(false)
    expect(localStorage.getItem('id_token')).toBeNull()
  })

  it('ignores unknown actions', () => {
    expect(authReducer(loggedOut, { type: 'NOPE', data: '' })).toBe(loggedOut)
  })
})

describe('AuthProvider', () => {
  it('provides auth state and can log out', () => {
    localStorage.clear()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(screen.getByRole('button')).toHaveTextContent('out')
    act(() => {
      screen.getByRole('button').click()
    })
    expect(screen.getByRole('button')).toHaveTextContent('out')
  })

  it('uses the default context outside a provider', () => {
    render(<Probe />)
    act(() => {
      screen.getByRole('button').click()
    })
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
