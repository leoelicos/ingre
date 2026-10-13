import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '../Header'

jest.mock('../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false, profile: null }, jest.fn()]
}))

jest.mock('../../lib/components', () => ({
  Header: ({ logoText }: { logoText: string }) => (
    <div data-testid="lib-header">{logoText}</div>
  )
}))

describe('Header', () => {
  it('renders with logo text', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )
    expect(screen.getByTestId('lib-header')).toHaveTextContent('ingré')
  })
})
