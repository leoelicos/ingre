import {   FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer
} from 'react'
import jwtDecode from 'jwt-decode'

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

type AuthContextType = [state: AuthType, dispatch: React.Dispatch<{ type: string; data: string }>]

const initialState: AuthType = readInitialAuth(localStorage.getItem('id_token'))

const AuthContext = createContext<AuthContextType>([initialState, () => {}])

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useAuthReducer(initialState)
  useEffect(() => {}, [])
  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuthContext = () => useContext(AuthContext)
export { AuthProvider, useAuthContext }
interface AuthState { loggedIn: boolean; profile: ProfileType | null }

const useAuthReducer = (initialState: AuthState) => {
  return useReducer(authReducer, initialState)
}

type reducerType = (state: AuthState, action: { type: string; data: string }) => AuthState
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

    case 'LOGOUT':
      localStorage.removeItem('id_token')
      return { ...state, profile: null, loggedIn: false }

    default:
      return state
  }
}
