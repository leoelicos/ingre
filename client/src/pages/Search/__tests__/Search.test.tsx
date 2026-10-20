import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import { recipe } from '../../../test/fixtures'
import Search, { SearchView } from '../Search'

const inProviders = (ui: JSX.Element) => (
  <MemoryRouter>
    <AuthProvider>
      <StoreProvider>{ui}</StoreProvider>
    </AuthProvider>
  </MemoryRouter>
)

describe('Search', () => {
  it('renders the heading and a search box that keeps what is typed', () => {
    render(inProviders(<Search />))
    expect(screen.getByText('Search')).toBeInTheDocument()
    const box = screen.getByPlaceholderText('Search')
    fireEvent.change(box, { target: { value: 'noodles' } })
    expect(screen.getByDisplayValue('noodles')).toBeInTheDocument()
    expect(screen.getByText('No recipes')).toBeInTheDocument()
    expect(document.title).toBe('Search')
  })

  it('shows recipes, or a loading message while searching', () => {
    const view = (loadingRecipes: boolean) =>
      inProviders(
        <SearchView
          searchText="pasta"
          onSearchChange={() => undefined}
          loadingRecipes={loadingRecipes}
          libraryRecipes={[recipe({ name: 'Pasta bake' })]}
        />
      )
    const { rerender } = render(view(false))
    expect(screen.getByText('Pasta bake')).toBeInTheDocument()
    rerender(view(true))
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })
})
