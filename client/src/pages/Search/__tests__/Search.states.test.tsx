import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Search from '../Search'

const mockSearch = {
  searchText: 'noodles',
  onSearchChange: jest.fn(),
  loadingEdamam: false,
  edamamRecipes: []
}

jest.mock('../useSearch', () => ({
  useSearch: () => mockSearch
}))

jest.mock(
  '../../../components/Widgets/RecipeCard/RecipeCardContainer',
  () => () => <div data-testid="cards" />
)

describe('Search states', () => {
  it('shows recipes or a loading message', () => {
    mockSearch.loadingEdamam = false
    const { rerender } = render(<Search />)
    expect(screen.getByTestId('cards')).toBeInTheDocument()
    expect(screen.getByDisplayValue('noodles')).toBeInTheDocument()
    mockSearch.loadingEdamam = true
    rerender(<Search />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })
})
