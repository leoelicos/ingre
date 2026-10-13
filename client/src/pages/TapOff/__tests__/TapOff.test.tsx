import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TapOff from '../TapOff'

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, jest.fn()]
}))

jest.mock('../../../utils/state/GlobalState', () => ({
  useStoreContext: () => [{ savedIngredients: [] }, jest.fn()]
}))

jest.mock('../../../utils/changeTitle', () => ({ changeTitle: jest.fn() }))
jest.mock('../../../components/NotLoggedIn', () => () => (
  <div>Not logged in</div>
))

describe('TapOff', () => {
  it('shows not logged in when unauthenticated', () => {
    render(
      <MemoryRouter>
        <TapOff />
      </MemoryRouter>
    )
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
  })
})
