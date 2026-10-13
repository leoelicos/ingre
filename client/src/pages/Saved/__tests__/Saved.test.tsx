import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Saved } from '../Saved'

jest.mock('../useSaved', () => ({
  useSaved: () => ({ loggedIn: false, loading: false, savedRecipes: [] })
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, jest.fn()]
}))

jest.mock('../../../components/NotLoggedIn', () => () => (
  <div>Not logged in</div>
))

describe('Saved', () => {
  it('shows not logged in when unauthenticated', () => {
    render(
      <MemoryRouter>
        <Saved />
      </MemoryRouter>
    )
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
  })
})
