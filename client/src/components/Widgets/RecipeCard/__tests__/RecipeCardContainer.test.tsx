import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCardContainer from '../RecipeCardContainer'
import { recipe } from '../../../../test/fixtures'

jest.mock('../../../../utils/auth/AuthContext', () => ({
  useAuthContext: () => [{ profile: { data: { pro: false } } }, jest.fn()]
}))

jest.mock('../RecipeCard', () => ({ recipe }: { recipe: { name: string } }) => (
  <tr data-testid="card">
    <td>{recipe.name}</td>
  </tr>
))

describe('RecipeCardContainer', () => {
  it('shows loading state', () => {
    render(
      <MemoryRouter>
        <RecipeCardContainer
          results={[]}
          loading={true}
          onSavedPage={false}
        />
      </MemoryRouter>
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows no recipes message when empty', () => {
    render(
      <MemoryRouter>
        <RecipeCardContainer
          results={[]}
          loading={false}
          onSavedPage={false}
        />
      </MemoryRouter>
    )
    expect(screen.getByText(/no recipes/i)).toBeInTheDocument()
  })

  it('renders recipe cards when results exist', () => {
    const results = [recipe({ name: 'Pasta', libraryId: '1' })]
    render(
      <MemoryRouter>
        <RecipeCardContainer
          results={results}
          loading={false}
          onSavedPage={false}
        />
      </MemoryRouter>
    )
    expect(screen.getByTestId('card')).toHaveTextContent('Pasta')
  })
})
