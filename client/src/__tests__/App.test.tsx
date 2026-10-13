import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

jest.mock('../utils/auth/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div>{children}</div>,
  useAuthContext: () => [{ loggedIn: false }, jest.fn()]
}))

jest.mock('../utils/state/GlobalState', () => ({
  StoreProvider: ({ children }: any) => <div>{children}</div>
}))

jest.mock('@apollo/client', () => ({
  ApolloProvider: ({ children }: any) => <div>{children}</div>,
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  createHttpLink: jest.fn(),
  gql: (s: TemplateStringsArray) => s
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(document.body).toBeInTheDocument()
  })
})
