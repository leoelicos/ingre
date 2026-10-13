import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Search from '../Search'

jest.mock('../useSearch', () => ({
  useSearch: () => ({
    searchText: '',
    onSearchChange: jest.fn(),
    loadingEdamam: false,
    edamamRecipes: []
  })
}))

jest.mock('../../../components/Widgets/RecipeCard/RecipeCardContainer', () => () => <div data-testid="cards" />)

describe('Search', () => {
  it('renders search heading and input', () => {
    render(<Search />)
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })
})
