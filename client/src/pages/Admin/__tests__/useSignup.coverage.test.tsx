import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { ApolloLink, Observable } from '@apollo/client'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { useSignup } from '../useSignup'
import { CHECK_EMAIL_ALREADY_EXISTS } from '../../../lib/apollo/graphQL/queries'
import { ADD_USER } from '../../../lib/apollo/graphQL/mutations'

const VALID_TOKEN =
  'eyJhbGciOiJub25lIn0.eyJkYXRhIjp7ImZpcnN0TmFtZSI6IkFkYSIsImVtYWlsIjoiYWRhQGIuYyIsIl9pZCI6IjEiLCJwcm8iOmZhbHNlfSwiZXhwIjo5OTk5OTk5OTk5fQ.'

type SignupOutcome = Awaited<
  ReturnType<ReturnType<typeof useSignup>['handleFormSubmit']>
>

const freeEmailMock: MockedResponse = {
  request: {
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email: 'ada@b.c' }
  },
  result: { data: { checkEmailAlreadyExists: false } }
}

const takenEmailMock: MockedResponse = {
  request: {
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email: 'taken@b.c' }
  },
  result: { data: { checkEmailAlreadyExists: true } }
}

const emailErrorMock: MockedResponse = {
  request: {
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email: 'ada@b.c' }
  },
  error: new Error('network down')
}

const successAddMock: MockedResponse = {
  request: {
    query: ADD_USER,
    variables: {
      input: {
        email: 'ada@b.c',
        password: 'secret',
        firstName: 'Ada',
        lastName: 'Lovelace'
      }
    }
  },
  result: {
    data: {
      addUser: {
        token: VALID_TOKEN,
        user: { _id: '1', firstName: 'Ada' }
      }
    }
  }
}

const emptyAddMock: MockedResponse = {
  request: {
    query: ADD_USER,
    variables: {
      input: {
        email: 'ada@b.c',
        password: 'secret',
        firstName: 'Ada',
        lastName: 'Lovelace'
      }
    }
  },
  result: { data: null }
}

const errorAddMock: MockedResponse = {
  request: {
    query: ADD_USER,
    variables: {
      input: {
        email: 'ada@b.c',
        password: 'secret',
        firstName: 'Ada',
        lastName: 'Lovelace'
      }
    }
  },
  error: new Error('exists')
}

/** A real link whose first request throws, so the email lookup itself rejects. */
const throwsOnceLink = () => {
  let calls = 0
  return new ApolloLink(() => {
    calls += 1
    if (calls === 1) throw new Error('link down')
    return Observable.of({ data: { checkEmailAlreadyExists: false } })
  })
}

const wrapper =
  (mocks: MockedResponse[], link?: ApolloLink) =>
  ({ children }: { children: React.ReactNode }) =>
    (
      <MockedProvider
        mocks={mocks}
        {...(link === undefined ? {} : { link })}
      >
        <MemoryRouter
          initialEntries={[{ pathname: '/signup', state: { from: '/' } }]}
        >
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )

const fill = (current: ReturnType<typeof useSignup>, email = 'ada@b.c') => {
  current.onFirstNameChange({ target: { value: 'Ada' } })
  current.onLastNameChange({ target: { value: 'Lovelace' } })
  current.onEmailChange({ target: { value: email } })
  current.onPasswordChange({ target: { value: 'secret' } })
}

const submit = (current: ReturnType<typeof useSignup>) =>
  current.handleFormSubmit({ preventDefault: () => undefined })

describe('useSignup coverage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('updates each field and logs the user in', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([freeEmailMock, successAddMock])
    })
    act(() => {
      fill(result.current)
    })
    let outcome: SignupOutcome = {
      ok: false,
      reason: 'error',
      message: ''
    }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome.ok).toBe(true)
  })

  it('returns a validation result when the first name is missing', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([])
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'validation',
      message: 'Please enter your first name.'
    })
    expect(result.current.validationMessage).toMatch(/first name/i)
  })

  it('returns a validation result when the email is missing', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([])
    })
    act(() => {
      result.current.onFirstNameChange({ target: { value: 'Ada' } })
      result.current.onPasswordChange({ target: { value: 'secret' } })
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'validation',
      message: 'Please enter an email address.'
    })
  })

  it('returns a validation result when the password is missing', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([])
    })
    act(() => {
      result.current.onFirstNameChange({ target: { value: 'Ada' } })
      result.current.onEmailChange({ target: { value: 'ada@b.c' } })
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'validation',
      message: 'Please enter a password.'
    })
  })

  it('returns email-exists and sets the message', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([takenEmailMock])
    })
    act(() => {
      fill(result.current, 'taken@b.c')
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'email-exists',
      message: 'A user with this email already exists.'
    })
    expect(result.current.validationMessage).toBe(
      'A user with this email already exists.'
    )
    expect(result.current.emailExists).toBe(true)
  })

  it('returns a check error when the email lookup fails', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([emailErrorMock])
    })
    act(() => {
      fill(result.current)
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'error',
      message: "Couldn't check that email."
    })
    expect(result.current.validationMessage).toBe("Couldn't check that email.")
  })

  it('surfaces one friendly message when sign-up returns no data', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([freeEmailMock, emptyAddMock])
    })
    act(() => {
      fill(result.current)
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'error',
      message: "Couldn't sign you up."
    })
    expect(result.current.validationMessage).toBe("Couldn't sign you up.")
  })

  it('surfaces one friendly message when the mutation fails', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([freeEmailMock, errorAddMock])
    })
    act(() => {
      fill(result.current)
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'error',
      message: "Couldn't sign you up."
    })
    expect(result.current.validationMessage).toBe("Couldn't sign you up.")
  })

  it('returns a validation result when the password is too short', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([])
    })
    act(() => {
      fill(result.current)
      result.current.onPasswordChange({ target: { value: 'abcd' } })
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'validation',
      message: 'Password must be at least 5 characters.'
    })
    expect(result.current.validationMessage).toBe(
      'Password must be at least 5 characters.'
    )
  })

  it('returns a check error when the email lookup throws', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([], throwsOnceLink())
    })
    act(() => {
      fill(result.current)
    })
    let outcome: SignupOutcome = { ok: true }
    await act(async () => {
      outcome = await submit(result.current)
    })
    expect(outcome).toEqual({
      ok: false,
      reason: 'error',
      message: "Couldn't check that email."
    })
    expect(result.current.validationMessage).toBe("Couldn't check that email.")
  })
})
