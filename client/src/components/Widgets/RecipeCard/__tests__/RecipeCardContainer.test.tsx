import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCardContainer from '../RecipeCardContainer'
import { recipe } from '../../../../test/fixtures'
import { logIn, ProfileFromToken } from '../../../../test/providers'
import { AuthProvider } from '../../../../utils/auth/AuthContext'
import type { ClientRecipe } from '../../../../types/client'

const grid = (results: ClientRecipe[], loading: boolean) => (
  <MemoryRouter>
    <AuthProvider>
      <ProfileFromToken />
      <RecipeCardContainer
        results={results}
        loading={loading}
      />
    </AuthProvider>
  </MemoryRouter>
)

describe('RecipeCardContainer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows loading state', () => {
    render(grid([], true))
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows no recipes message when empty', () => {
    render(grid([], false))
    expect(screen.getByText(/no recipes/i)).toBeInTheDocument()
  })

  it('renders a real card per recipe, without instructions for a visitor', () => {
    render(grid([recipe({ name: 'Pasta', libraryId: '1' })], false))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Pasta' })).toHaveAttribute(
      'href',
      '/recipe/1'
    )
    expect(screen.queryByText(/instructions/i)).toBeNull()
  })

  it('passes pro from the logged-in profile to each card', () => {
    logIn(true)
    render(grid([recipe({ name: 'Pasta', libraryId: '1' })], false))
    expect(screen.getByText(/instructions/i)).toBeInTheDocument()
  })
})
