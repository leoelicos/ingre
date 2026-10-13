import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Saved } from '../Saved'
import { recipe } from '../../../test/fixtures'

const mockSaved: {
  loading: boolean
  error: Error | undefined
  savedRecipes: ReturnType<typeof recipe>[]
} = {
  loading: false,
  error: undefined,
  savedRecipes: []
}
const mockAuth = { loggedIn: true }

jest.mock('../useSaved', () => ({
  useSaved: () => mockSaved
}))

jest.mock('../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [mockAuth, jest.fn()]
}))

jest.mock('../../../components/NotLoggedIn', () => () => (
  <div>Not logged in</div>
))
jest.mock(
  '../../../components/Widgets/RecipeCard/RecipeCardContainer',
  () => () => <div data-testid="cards" />
)

describe('Saved states', () => {
  beforeEach(() => {
    mockAuth.loggedIn = true
    mockSaved.loading = false
    mockSaved.error = undefined
    mockSaved.savedRecipes = []
  })

  it('shows loading, an error, and the recipe list', () => {
    mockSaved.loading = true
    const { rerender } = render(
      <MemoryRouter>
        <Saved />
      </MemoryRouter>
    )
    expect(screen.getByText(/loading saved recipes/i)).toBeInTheDocument()

    mockSaved.loading = false
    mockSaved.error = new Error('nope')
    rerender(
      <MemoryRouter>
        <Saved />
      </MemoryRouter>
    )
    expect(screen.getByText(/couldn't load saved recipes/i)).toBeInTheDocument()

    mockSaved.error = undefined
    mockSaved.savedRecipes = [recipe()]
    rerender(
      <MemoryRouter>
        <Saved />
      </MemoryRouter>
    )
    expect(screen.getByTestId('cards')).toBeInTheDocument()
  })
})
