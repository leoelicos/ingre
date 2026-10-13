import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../lib/apollo/graphQL/mutations'
import { useAuthContext } from '../utils/auth/AuthContext'

export const useAuth = () => {
  const [, dispatch] = useAuthContext()
  const navigate = useNavigate()

  const [loginMutation, { loading: loginLoading, error: loginError }] =
    useMutation(LOGIN, {
      onCompleted: (data) => {
        if (data?.login?.token) {
          dispatch({ type: 'LOGIN', data: data.login.token })
          navigate(-1)
        }
      },
      onError: (error) => {
        // send them to an error page?
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
