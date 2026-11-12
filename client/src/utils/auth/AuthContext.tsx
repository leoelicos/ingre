import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer
} from 'react'
import jwtDecode from 'jwt-decode'
import { onFirebaseSession } from './firebase'

interface ProfileType {
  data: {
    firstName: string
    email: string
    _id: string
    pro: boolean
  }
  exp: number
}

interface AuthType {
  profile: ProfileType | null
  loggedIn: boolean
}

const isJwtExpired = (token: string) =>
  jwtDecode<ProfileType>(token).exp < Date.now() / 1000

export function readInitialAuth(token: string | null): AuthType {
  return {
    profile: null,
    loggedIn: token !== null && !isJwtExpired(token)
  }
}

type AuthContextType = [
  state: AuthType,
  dispatch: React.Dispatch<{ type: string; data: string }>
]

/** The stored token's auth state, read when a provider mounts (not at import), so a page or test sees the current token. */
export const readStoredAuth = (): AuthType =>
  readInitialAuth(localStorage.getItem('id_token'))

const AuthContext = createContext<AuthContextType>([readStoredAuth(), () => {}])

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, null, readStoredAuth)
  // Firebase Auth: a saved Firebase session signs in once it has loaded
  useEffect(
    () =>
      onFirebaseSession(
        () => dispatch({ type: 'FIREBASE_IN', data: '' }),
        () => dispatch({ type: 'FIREBASE_OUT', data: '' })
      ),
    []
  )
  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuthContext = () => useContext(AuthContext)
export { AuthProvider, useAuthContext }
interface AuthState {
  loggedIn: boolean
  profile: ProfileType | null
}

type reducerType = (
  state: AuthState,
  action: { type: string; data: string }
) => AuthState
export const authReducer: reducerType = (state, action) => {
  switch (action.type) {
    case 'UPDATE':
      const token = localStorage.getItem('id_token')
      if (token === null) {
        return { ...state, loggedIn: false }
      } else if (isJwtExpired(token)) {
        localStorage.removeItem('id_token')
        return { ...state, loggedIn: false }
      } else {
        return { ...state, profile: jwtDecode(token), loggedIn: true }
      }

    case 'LOGIN':
      const serverToken = action.data
      localStorage.setItem('id_token', serverToken)
      return { ...state, profile: jwtDecode(serverToken), loggedIn: true }

    // Firebase Auth: the API knows who it is from the ID token, so there's no profile here
    case 'FIREBASE_IN':
      return { ...state, loggedIn: true }

    // Firebase Auth: out of Firebase; still in only with a valid legacy token
    case 'FIREBASE_OUT':
      return { ...state, loggedIn: readStoredAuth().loggedIn }

    case 'LOGOUT':
      localStorage.removeItem('id_token')
      return { ...state, profile: null, loggedIn: false }

    default:
      return state
  }
}
