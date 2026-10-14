import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../lib/apollo/graphQL/mutations'
import { useAuthContext } from '../utils/auth/AuthContext'
import { returnPath } from '../utils/auth/returnPath'

export const useAuth = () => {
  const [, dispatch] = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const from = returnPath(location.state)

  const [loginMutation, { loading: loginLoading, error: loginError }] =
    useMutation(LOGIN, {
      onCompleted: (data) => {
        dispatch({ type: 'LOGIN', data: data.login.token })
        navigate(from, { replace: true })
      },
      onError: (error) => {
        console.error(error)
      }
    })

  const login = async ({
    email,
    password
  }: {
    email: string
    password: string
  }): Promise<void> => {
    loginMutation({ variables: { email, password } })
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT', data: '' })
  }

  return {
    login,
    handleLogout,
    loginLoading,
    loginError
  }
}
