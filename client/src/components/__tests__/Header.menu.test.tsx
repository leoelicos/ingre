import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '../Header'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../utils/auth/AuthContext'
import { addFontAwesome } from '../../utils/addFontAwesome'

addFontAwesome()

describe('Header menu', () => {
  it('reads Recipes, Saved, Shopping list', () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <AuthProvider>
            <Header />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    const names = ['Recipes', 'Saved', 'Shopping list']
    names.forEach((name) =>
      expect(screen.getAllByRole('link', { name }).length).toBeGreaterThan(0)
    )
    expect(screen.queryByRole('link', { name: 'Pick' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Recipes' })[0]).toHaveAttribute(
      'href',
      '/'
    )
  })
})
