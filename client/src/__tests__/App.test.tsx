import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { authHeaders, graphqlEndpoint, Ingre, withAuthHeaders } from '../App'

/** Renders the whole app at a path, as a browser would open it. */
const openAt = (path: string) => {
  window.history.pushState({}, '', path)
  return render(<Ingre />)
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens on the one page: the header, Explore, Ingredients and Recipes (#164, #179, #181)', () => {
    openAt('/')
    expect(screen.getByRole('link', { name: 'ingré' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(
      screen.getByRole('searchbox', { name: 'Search ingredients and recipes' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Shopping list' })
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Explore' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Recipes' })
    ).toBeInTheDocument()
    expect(screen.queryByText('At home')).not.toBeInTheDocument()
    expect(screen.queryByText('At the shop')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
  })

  it('old Saved links open the page with the Saved filter on (#160)', () => {
    openAt('/saved')
    expect(window.location.pathname).toBe('/')
    expect(window.location.search).toBe('?saved=1')
    expect(screen.getByRole('switch', { name: 'Saved' })).toBeChecked()
  })

  it.each(['/ingredients', '/tapoff'])(
    'the old step address %s redirects to the one page (#179)',
    (path) => {
      openAt(`${path}?q=dahl`)
      expect(window.location.pathname).toBe('/')
      expect(window.location.search).toBe('?q=dahl')
      expect(
        screen.getByRole('heading', { level: 1, name: 'Shopping list' })
      ).toBeInTheDocument()
    }
  )

  it('builds the graphql endpoint for each environment', () => {
    expect(graphqlEndpoint('production', '')).toBe(
      'https://ingre-backend.onrender.com/graphql'
    )
    expect(graphqlEndpoint('test', '')).toBe('http://localhost:3001/graphql')
    expect(graphqlEndpoint('development', '')).toBe(
      'http://localhost:3001/graphql'
    )
  })

  it('uses the override when one is set (the e2e server)', () => {
    expect(
      graphqlEndpoint('development', 'http://localhost:4311/graphql')
    ).toBe('http://localhost:4311/graphql')
  })

  it('adds a bearer token when one is stored', () => {
    localStorage.setItem('id_token', 'abc')
    expect(authHeaders({ accept: 'json' })).toEqual({
      headers: { accept: 'json', authorization: 'Bearer abc' }
    })
    expect(
      withAuthHeaders({}, { headers: { accept: 'json' } }).headers[
        'authorization'
      ]
    ).toBe('Bearer abc')
  })

  it('uses an empty authorization header without a token', () => {
    expect(authHeaders(undefined)).toEqual({ headers: { authorization: '' } })
    expect(withAuthHeaders({}, {}).headers['authorization']).toBe('')
  })
})
