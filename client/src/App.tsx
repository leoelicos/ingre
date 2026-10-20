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
import { Analytics } from '@vercel/analytics/react'
import { Header } from './components/Header'
import { MAIN_ID, SkipLink } from './components/SkipLink'
import { Login } from './pages/Admin/Login'
import { NoMatch } from './pages/Admin/NoMatch'
import RecipePage from './pages/Recipe/RecipePage'
import { Signup } from './pages/Admin/Signup'
import { Success } from './pages/Admin/Success'
import Upgrade from './pages/Admin/Upgrade'
import { ShoppingFlow } from './pages/ShoppingList/ShoppingFlow'
import { SAVED_PATH } from './components/AccountMenu/accountItems'
import Search from './pages/Search/Search'
import TapOff from './pages/TapOff/TapOff'
import { APP_MODE } from './appMode'
import { addFontAwesome } from './utils/addFontAwesome'
import { AuthProvider } from './utils/auth/AuthContext'
import { changeTitle } from './utils/changeTitle'
import { StoreProvider } from './utils/state/GlobalState'

addFontAwesome()

export function graphqlEndpoint(mode: string): string {
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

const uri = graphqlEndpoint(APP_MODE)
const httpLink = createHttpLink({ uri })
const link = authLink.concat(httpLink)
const cache = new InMemoryCache()
const client = new ApolloClient({ link, cache })

/** Old Saved links land on Pick with the Saved filter on (#160). */
export const SavedRedirect: FC = () => (
  <Navigate
    to={SAVED_PATH}
    replace={true}
  />
)

/** The shopping list is the workspace at "/" (#164); router state (Back to my list) comes along. */
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

/** Vercel Web Analytics (#177), cookie-free: only in the production build, so dev, tests and e2e make no outside request. */
export const SiteAnalytics: FC<{ mode: string }> = ({ mode }) =>
  mode === 'production' ? <Analytics /> : null

export const Ingre: FC = () => {
  changeTitle('Pick')
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>
          <StoreProvider>
            <SkipLink />
            <Header />
            <main
              id={MAIN_ID}
              tabIndex={-1}
              className="focus:outline-none"
            >
              <Routes>
                <Route
                  path="/"
                  element={<ShoppingFlow />}
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
                  path="/recipe/:id"
                  element={<RecipePage />}
                />
                <Route
                  path="/tapoff"
                  element={<TapOff />}
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
            </main>
            <SiteAnalytics mode={APP_MODE} />
          </StoreProvider>
        </AuthProvider>
      </Router>
    </ApolloProvider>
  )
}
