import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { useSignup } from '../useSignup'
import { CHECK_EMAIL_ALREADY_EXISTS } from '../../../lib/apollo/graphQL/queries'
import { ADD_USER } from '../../../lib/apollo/graphQL/mutations'

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))

const VALID_TOKEN =
  'eyJhbGciOiJub25lIn0.eyJkYXRhIjp7ImZpcnN0TmFtZSI6IkFkYSIsImVtYWlsIjoiYWRhQGIuYyIsIl9pZCI6IjEiLCJwcm8iOmZhbHNlfSwiZXhwIjo5OTk5OTk5OTk5fQ.'

const freeEmailMock: MockedResponse = {
  request: {
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email: 'ada@b.c' }
  },
  result: { data: { checkEmailAlreadyExists: false } }
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

const wrapper =
  (mocks: MockedResponse[]) =>
  ({ children }: { children: React.ReactNode }) =>
    (
      <MockedProvider mocks={mocks}>
        <MemoryRouter
          initialEntries={[{ pathname: '/signup', state: { from: '/' } }]}
        >
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )

describe('useSignup coverage', () => {
  it('updates each field and logs the user in', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([freeEmailMock, successAddMock])
    })
    act(() => {
      result.current.onFirstNameChange({ target: { value: 'Ada' } })
      result.current.onLastNameChange({ target: { value: 'Lovelace' } })
      result.current.onEmailChange({ target: { value: 'ada@b.c' } })
      result.current.onPasswordChange({ target: { value: 'secret' } })
    })
    let outcome: Awaited<ReturnType<typeof result.current.handleFormSubmit>>
    await act(async () => {
      outcome = await result.current.handleFormSubmit({
        preventDefault: () => undefined
      })
    })
    expect(outcome!.ok).toBe(true)
  })

  it('returns a validation result when required fields are missing', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([])
    })
    let outcome: Awaited<ReturnType<typeof result.current.handleFormSubmit>>
    await act(async () => {
      outcome = await result.current.handleFormSubmit({
        preventDefault: () => undefined
      })
    })
    expect(outcome!.ok).toBe(false)
    if (!outcome!.ok) {
      expect(outcome!.reason).toBe('validation')
    }
    expect(result.current.validationMessage).toMatch(/first name/i)
  })

  it('surfaces an error when the mutation fails', async () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: wrapper([freeEmailMock, errorAddMock])
    })
    act(() => {
      result.current.onFirstNameChange({ target: { value: 'Ada' } })
      result.current.onLastNameChange({ target: { value: 'Lovelace' } })
      result.current.onEmailChange({ target: { value: 'ada@b.c' } })
      result.current.onPasswordChange({ target: { value: 'secret' } })
    })
    let outcome: Awaited<ReturnType<typeof result.current.handleFormSubmit>>
    await act(async () => {
      outcome = await result.current.handleFormSubmit({
        preventDefault: () => undefined
      })
    })
    expect(outcome!.ok).toBe(false)
    if (!outcome!.ok) {
      expect(outcome!.reason).toBe('error')
    }
    expect(result.current.validationMessage).toBeTruthy()
  })
})
