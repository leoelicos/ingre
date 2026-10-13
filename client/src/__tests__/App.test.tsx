import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { authHeaders, graphqlEndpoint, Ingre, withAuthHeaders } from '../App'

jest.mock('../pages/Home/Home', () => () => <div>Home page</div>)
jest.mock('../pages/Search/Search', () => () => <div>Search page</div>)
jest.mock('../pages/Customise/Customise', () => () => <div>Customise page</div>)
jest.mock('../pages/Saved/Saved', () => ({
  Saved: () => <div>Saved page</div>
}))
jest.mock('../pages/Ingredients/Ingredients', () => ({
  Ingredients: () => <div>Ingredients page</div>
}))
jest.mock('../pages/TapOff/TapOff', () => () => <div>Tapoff page</div>)
jest.mock('../pages/Admin/Login', () => ({
  Login: () => <div>Login page</div>
}))
jest.mock('../pages/Admin/Signup', () => ({
  Signup: () => <div>Signup page</div>
}))
jest.mock('../pages/Admin/Upgrade', () => () => <div>Upgrade page</div>)
jest.mock('../pages/Admin/Success', () => ({
  Success: () => <div>Success page</div>
}))
jest.mock('../pages/Admin/NoMatch', () => ({
  NoMatch: () => <div>No match</div>
}))
jest.mock('../components/Header', () => ({ Header: () => <div>Header</div> }))

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the home route', () => {
    render(<Ingre />)
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('builds the graphql endpoint for each environment', () => {
    expect(graphqlEndpoint('production')).toBe(
      'https://ingre-backend.onrender.com/graphql'
    )
    expect(graphqlEndpoint('test')).toBe('http://localhost:3001/graphql')
    expect(graphqlEndpoint(undefined)).toBe('http://localhost:3001/graphql')
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
