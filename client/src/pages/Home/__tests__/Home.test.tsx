import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../Home'

jest.mock('../useHome', () => ({
  useHome: () => ({
    loggedIn: true,
    firstName: 'Test',
    loadingEdamam: false,
    edamamRecipes: [],
    handleRefresh: jest.fn()
  })
}))

jest.mock('../../components/Widgets/RecipeCard/RecipeCardContainer', () => () => <div data-testid="recipe-cards" />)

describe('Home', () => {
  it('renders welcome message when logged in', () => {
    render(<Home />)
    expect(screen.getByText(/welcome test/i)).toBeInTheDocument()
  })
})
