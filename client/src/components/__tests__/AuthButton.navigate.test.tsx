import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { AuthButton } from '../AuthButton'

describe('AuthButton onNavigate', () => {
  it('calls onNavigate then logout when logged in', () => {
    const onNavigate = jest.fn()
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <AuthProvider>
            <AuthButton
              loggedIn
              onNavigate={onNavigate}
            />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /log\s*out/i }))
    expect(onNavigate).toHaveBeenCalled()
  })
})
