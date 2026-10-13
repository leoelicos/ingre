import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCard from '../RecipeCard'
import { recipe, omit } from '../../../../test/fixtures'
import type { ClientRecipe } from '../../../../types/client'

const mockCard: {
  handleSave: () => void
  savedRecipes: ClientRecipe[]
  saveRecipeLoading: boolean
} = {
  handleSave: () => undefined,
  savedRecipes: [],
  saveRecipeLoading: false
}
const mockAuth: { loggedIn: boolean } = { loggedIn: false }

jest.mock('../useRecipeCard', () => ({
  useRecipeCard: () => mockCard
}))

jest.mock('../../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [mockAuth, jest.fn()]
}))

describe('RecipeCard states', () => {
  beforeEach(() => {
    mockAuth.loggedIn = false
  })

  it('shows instructions only for a logged-in pro', () => {
    mockAuth.loggedIn = false
    const { rerender } = render(
      <MemoryRouter>
        <RecipeCard
          recipe={recipe()}
          onSavedPage={false}
          pro={true}
        />
      </MemoryRouter>
    )
    expect(screen.queryByText(/instructions/i)).not.toBeInTheDocument()

    mockAuth.loggedIn = true
    rerender(
      <MemoryRouter>
        <RecipeCard
          recipe={recipe()}
          onSavedPage={false}
          pro={false}
        />
      </MemoryRouter>
    )
    expect(screen.queryByText(/instructions/i)).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <RecipeCard
          recipe={recipe()}
          onSavedPage={false}
          pro={true}
        />
      </MemoryRouter>
    )
    expect(screen.getByText(/instructions/i)).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <RecipeCard
          recipe={omit(recipe(), 'libraryId')}
          onSavedPage={false}
          pro={true}
        />
      </MemoryRouter>
    )
    expect(screen.getByText('Pasta')).toBeInTheDocument()
  })
})
