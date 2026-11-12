import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApolloClient, useMutation } from '@apollo/client'
import { LOGIN } from '../lib/apollo/graphQL/mutations'
import { useAuthContext } from '../utils/auth/AuthContext'
import { returnPath } from '../utils/auth/returnPath'
import { useFirebaseSignIn } from '../utils/auth/useFirebaseSignIn'
import {
  firebaseEnabled,
  signInWithEmail,
  signInWithGoogle,
  signOutOfFirebase
} from '../utils/auth/firebase'

export const useAuth = () => {
  const [, dispatch] = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const client = useApolloClient()
  const from = returnPath(location.state)
  const [firebaseError, setFirebaseError] = useState(false)
  const { finish, loading: firebaseLoading } = useFirebaseSignIn()

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

  /** Firebase Auth: signs in, then goes back where the visitor came from. */
  const viaFirebase = async (signIn: () => Promise<void>): Promise<void> => {
    setFirebaseError(false)
    if (await finish(signIn)) navigate(from, { replace: true })
    else setFirebaseError(true)
  }

  const login = async ({
    email,
    password
  }: {
    email: string
    password: string
  }): Promise<void> => {
    if (firebaseEnabled())
      return viaFirebase(() => signInWithEmail(email, password))
    loginMutation({ variables: { email, password } })
  }

  /** Firebase Auth: Google sign-in; does nothing while Firebase is off. */
  const loginWithGoogle = async (): Promise<void> => {
    if (firebaseEnabled()) await viaFirebase(signInWithGoogle)
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT', data: '' })
    // Firebase Auth: out of Firebase too, and forget the last user's cached data
    void signOutOfFirebase()
    void client.clearStore()
  }

  return {
    login,
    loginWithGoogle,
    handleLogout,
    loginLoading: loginLoading || firebaseLoading,
    loginError: loginError !== undefined || firebaseError
  }
}
