import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { MAKE_USER_PRO } from '../../lib/apollo/graphQL/mutations'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { clearPendingTier, readPendingTier } from '../../utils/tier/pending'

export const useSuccess = () => {
  const [makeUserPro] = useMutation(MAKE_USER_PRO)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn

  const Token = () => {
    return null
  }

  useEffect(() => {
    async function saveOrder() {
      try {
        const tier = readPendingTier()
        await makeUserPro(tier ? { variables: { tier } } : undefined)
        clearPendingTier()

        setTimeout(() => {
          navigate('/upgrade')
        }, 3000)
      } catch (e) {
        console.error(e)
      }
    }

    saveOrder()
  }, [makeUserPro, navigate])

  return { loggedIn, Token, searchParams }
}
