import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Ingredients } from '../Ingredients'

jest.mock('../useIngredients', () => ({
  useIngredients: () => ({ savedRecipeLoading: false, savedRecipeError: null })
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ loggedIn: false }, jest.fn()]
}))

jest.mock('../../../components/NotLoggedIn', () => () => <div>Not logged in</div>)

describe('Ingredients', () => {
  it('shows not logged in when unauthenticated', () => {
    render(
      <MemoryRouter>
        <Ingredients />
      </MemoryRouter>
    )
    expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
  })
})
