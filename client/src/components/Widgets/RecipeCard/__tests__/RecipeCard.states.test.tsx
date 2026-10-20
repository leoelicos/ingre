import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCard from '../RecipeCard'
import { recipe, omit } from '../../../../test/fixtures'
import { logIn } from '../../../../test/providers'
import { AuthProvider } from '../../../../utils/auth/AuthContext'
import type { ClientRecipe } from '../../../../types/client'

const card = (r: ClientRecipe, pro: boolean) => (
  <MemoryRouter>
    <AuthProvider>
      <RecipeCard
        recipe={r}
        pro={pro}
        pick={null}
      />
    </AuthProvider>
  </MemoryRouter>
)

describe('RecipeCard states', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('hides instructions when logged out, even for a pro card', () => {
    render(card(recipe(), true))
    expect(screen.queryByText(/instructions/i)).not.toBeInTheDocument()
  })

  it('shows instructions only for a logged-in pro', () => {
    logIn(true)
    const { unmount } = render(card(recipe(), false))
    expect(screen.queryByText(/instructions/i)).not.toBeInTheDocument()
    unmount()
    render(card(recipe(), true))
    expect(screen.getByText(/instructions/i)).toBeInTheDocument()
  })

  it('shows a plain title when the recipe is not from the library', () => {
    logIn(true)
    render(card(omit(recipe(), 'libraryId'), true))
    expect(screen.getByText('Pasta')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pasta' })).toBeNull()
  })
})
