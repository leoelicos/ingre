import jwtDecode from 'jwt-decode'
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
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
  token: string | null
  loggedIn: boolean
}

const isJwtExpired = (token: string) =>
  jwtDecode<ProfileType>(token).exp < Date.now() / 1000

/*   context */
type AuthContextType = [state: AuthType, dispatch: React.Dispatch<any>]

const initialState: AuthType = {
  profile: null,
  token: null,
  loggedIn: false
}

const AuthContext = createContext<AuthContextType>([initialState, () => {}])

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useAuthReducer(initialState)
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
  console.log(`AUTH\t[${action.type}]`, action.data)

  switch (action.type) {
    case 'UPDATE':
      const localStorageToken = localStorage.getItem('id_token')
      if (
        state.token === null &&
        (!localStorageToken || isJwtExpired(localStorageToken))
      )
        return { ...state, loggedIn: false }
      else if (isJwtExpired(state.token)) return { ...state, loggedIn: false }
      else return state

    case 'LOGIN':
      const serverToken = action.data
      localStorage.setItem('id_token', serverToken)
      return {
        ...state,
        token: serverToken,
        profile: jwtDecode(serverToken),
        loggedIn: true
      }

    case 'LOGOUT':
      localStorage.removeItem('id_token')
      return { ...state, token: null, profile: null, loggedIn: false }

    default:
      return state
  }
}
