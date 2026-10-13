import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../Home'

const mockHome = {
  loggedIn: true,
  firstName: 'Test',
  loadingRecipes: false,
  libraryRecipes: [],
  handleRefresh: jest.fn()
}

jest.mock('../useHome', () => ({
  useHome: () => mockHome
}))

jest.mock(
  '../../../components/Widgets/RecipeCard/RecipeCardContainer',
  () => () => <div data-testid="recipe-cards" />
)

describe('Home', () => {
  it('renders welcome message when logged in', () => {
    mockHome.loggedIn = true
    mockHome.loadingRecipes = false
    mockHome.firstName = 'Test'
    render(<Home />)
    expect(screen.getByText(/welcome test/i)).toBeInTheDocument()
    expect(screen.getByTestId('recipe-cards')).toBeInTheDocument()
  })

  it('hides the welcome message when logged out', () => {
    mockHome.loggedIn = false
    mockHome.loadingRecipes = false
    render(<Home />)
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument()
  })

  it('shows a loading message', () => {
    mockHome.loggedIn = true
    mockHome.loadingRecipes = true
    render(<Home />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
