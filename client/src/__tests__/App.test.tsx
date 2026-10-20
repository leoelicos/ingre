import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { authHeaders, graphqlEndpoint, Ingre, withAuthHeaders } from '../App'
import { STEP_KEY } from '../utils/storage/shoppingState'

/** Renders the whole app at a path, as a browser would open it. */
const openAt = (path: string) => {
  window.history.pushState({}, '', path)
  return render(<Ingre />)
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens on the workspace: the header and Pick (#164)', () => {
    openAt('/')
    expect(screen.getByRole('link', { name: 'ingré' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(
      screen.getByRole('combobox', { name: 'Search recipes or ingredients' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pick' })
    ).toBeInTheDocument()
  })

  it('old Saved links open Pick with the Saved filter on (#160)', () => {
    localStorage.setItem(STEP_KEY, '"shop"')
    openAt('/saved')
    expect(window.location.pathname).toBe('/')
    expect(window.location.search).toBe('?saved=1')
    expect(screen.getByRole('switch', { name: 'Saved' })).toBeChecked()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pick' })
    ).toBeInTheDocument()
  })

  it('the old shopping list address opens the workspace', () => {
    localStorage.setItem(STEP_KEY, '"home"')
    openAt('/ingredients')
    expect(window.location.pathname).toBe('/')
    expect(
      screen.getByRole('heading', { level: 1, name: 'At home' })
    ).toBeInTheDocument()
  })

  it('builds the graphql endpoint for each environment', () => {
    expect(graphqlEndpoint('production')).toBe(
      'https://ingre-backend.onrender.com/graphql'
    )
    expect(graphqlEndpoint('test')).toBe('http://localhost:3001/graphql')
    expect(graphqlEndpoint('development')).toBe('http://localhost:3001/graphql')
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
