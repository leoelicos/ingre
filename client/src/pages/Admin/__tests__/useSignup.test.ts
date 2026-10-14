import { createElement, type ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { useSignup } from '../useSignup'

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    MockedProvider,
    null,
    createElement(
      MemoryRouter,
      null,
      createElement(AuthProvider, null, children)
    )
  )

describe('useSignup', () => {
  it('returns form handlers', () => {
    const { result } = renderHook(() => useSignup(), { wrapper })
    expect(typeof result.current.handleFormSubmit).toBe('function')
    expect(typeof result.current.onFirstNameChange).toBe('function')
    expect(typeof result.current.onEmailChange).toBe('function')
  })
})
