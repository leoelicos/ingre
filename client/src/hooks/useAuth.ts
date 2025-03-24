import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN } from 'lib/apollo/graphQL/mutations'
import { useAuthContext } from 'utils/auth/AuthContext'

export const useAuth = () => {
  const [_auth, dispatch] = useAuthContext()
  const navigate = useNavigate()

  const [login, { loading: loginLoading, error: loginError }] = useMutation(
    LOGIN,
    {
      onCompleted: (data) => {
        const {
          login: { token }
        } = data
        dispatch({ type: 'LOGIN', data: token })
        navigate(-1)
      },
      onError: (error) => {
        console.error(error)
      }
    }
  )

  const handleLogin = async ({
    email,
    password
  }: {
    email: string
    password: string
  }) => {
    login({ variables: { email, password } })
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  return { handleLogin, handleLogout, loginLoading, loginError }
}
