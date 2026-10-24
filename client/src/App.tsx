import type { FC } from 'react'
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation
} from 'react-router-dom'
import { Header } from './components/Header'
import { Login } from './pages/Admin/Login'
import { NoMatch } from './pages/Admin/NoMatch'
import { Signup } from './pages/Admin/Signup'
import { Success } from './pages/Admin/Success'
import Upgrade from './pages/Admin/Upgrade'
import { ListPage } from './pages/List/ListPage'
import { SAVED_PATH } from './components/AccountMenu/accountItems'
import Search from './pages/Search/Search'
import { APP_MODE, GRAPHQL_URL_OVERRIDE } from './appMode'
import { addFontAwesome } from './utils/addFontAwesome'
import { AuthProvider } from './utils/auth/AuthContext'
import { ExploreProvider } from './utils/explore/ExploreContext'
import { changeTitle } from './utils/changeTitle'
import { StoreProvider } from './utils/state/GlobalState'

addFontAwesome()

export function graphqlEndpoint(mode: string, override: string): string {
  if (override !== '') return override
  if (mode === 'production') {
    return 'https://ingre-backend.onrender.com/graphql'
  }
  return 'http://localhost:3001/graphql'
}

export function authHeaders(oldHeaders: Record<string, string> | undefined): {
  headers: Record<string, string>
} {
  const token = localStorage.getItem('id_token')
  const authorization = token ? `Bearer ${token}` : ''
  const headers = { ...oldHeaders, authorization }
  return { headers }
}

export const withAuthHeaders = (
  _operation: unknown,
  context: { headers?: Record<string, string> }
) => authHeaders(context.headers)

const authLink = setContext(withAuthHeaders)

const uri = graphqlEndpoint(APP_MODE, GRAPHQL_URL_OVERRIDE)
const httpLink = createHttpLink({ uri })
const link = authLink.concat(httpLink)
const cache = new InMemoryCache()
const client = new ApolloClient({ link, cache })

/** Old Saved links land on the page with the Saved filter on (#160). */
export const SavedRedirect: FC = () => (
  <Navigate
    to={SAVED_PATH}
    replace={true}
  />
)

/** Old list and step URLs (/ingredients, /tapoff) land on the one page at "/" (#164, #179). */
export const WorkspaceRedirect: FC = () => {
  const { search, state } = useLocation()
  return (
    <Navigate
      to={{ pathname: '/', search }}
      replace={true}
      state={state}
    />
  )
}

export const Ingre: FC = () => {
  changeTitle('Shopping list')
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>
          <StoreProvider>
            <ExploreProvider>
              <Header />
              <Routes>
                <Route
                  path="/"
                  element={<ListPage />}
                />
                <Route
                  path="/search"
                  element={<Search />}
                />
                <Route
                  path="/saved"
                  element={<SavedRedirect />}
                />
                <Route
                  path="/ingredients"
                  element={<WorkspaceRedirect />}
                />
                <Route
                  path="/tapoff"
                  element={<WorkspaceRedirect />}
                />
                {/* admin */}
                <Route
                  path="/login"
                  element={<Login />}
                />
                <Route
                  path="/signup"
                  element={<Signup />}
                />
                <Route
                  path="/upgrade"
                  element={<Upgrade />}
                />
                <Route
                  path="/success"
                  element={<Success />}
                />
                <Route
                  path="*"
                  element={<NoMatch />}
                />
              </Routes>
            </ExploreProvider>
          </StoreProvider>
        </AuthProvider>
      </Router>
    </ApolloProvider>
  )
}
