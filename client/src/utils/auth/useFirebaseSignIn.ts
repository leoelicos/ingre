import { useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { GET_USER } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from './AuthContext'
import { signOutOfFirebase } from './firebase'

/**
 * Firebase Auth: runs a Firebase sign-in or sign-up, then asks the API who that is. The
 * API links the Firebase account to the ingré user (or makes one) on that request; when
 * it refuses (say, an unverified email that belongs to an account), Firebase is signed
 * out again so the visitor isn't half signed in. Resolves whether it worked.
 */
export const useFirebaseSignIn = () => {
  const [, dispatch] = useAuthContext()
  const client = useApolloClient()
  const [loading, setLoading] = useState(false)

  const finish = async (signIn: () => Promise<void>): Promise<boolean> => {
    setLoading(true)
    try {
      await signIn()
      await client.query({ query: GET_USER, fetchPolicy: 'network-only' })
      dispatch({ type: 'FIREBASE_IN', data: '' })
      return true
    } catch (error) {
      console.error(error)
      await signOutOfFirebase()
      return false
    } finally {
      setLoading(false)
    }
  }

  return { finish, loading }
}
