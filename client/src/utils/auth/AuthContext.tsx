import jwtDecode from 'jwt-decode'
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer
} from 'react'

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

type AuthContextType = [state: AuthType, dispatch: React.Dispatch<any>]

const initialToken = localStorage.getItem('id_token')
const initialState: AuthType = {
  profile: null,
  loggedIn: initialToken !== null && !isJwtExpired(initialToken as string)
}

const AuthContext = createContext<AuthContextType>([initialState, () => {}])

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useAuthReducer(initialState)

  /* update from local storage the first time */
  useEffect(() => {}, [])
  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuthContext = () => useContext(AuthContext)
export { AuthProvider, useAuthContext }
const useAuthReducer = (initialState: any) => {
  return useReducer(reducer, initialState)
}

type reducerType = (state: any, action: { type: string; data: any }) => any
const reducer: reducerType = (state, action) => {
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
