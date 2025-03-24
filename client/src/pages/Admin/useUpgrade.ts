import { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { loadStripe } from '@stripe/stripe-js'
import { CHECKOUT, GET_USER } from 'lib/apollo/graphQL/queries'
import { useAuthContext } from 'utils/auth/AuthContext'

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx')
export const useUpgrade = () => {
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn

  const [getCheckout, { data }] = useLazyQuery(CHECKOUT, {
    fetchPolicy: 'network-only'
    // nextFetchPolicy: 'cache-first'
  })
  const {
    data: userData,
    loading: userLoading,
    error: userError
  } = useQuery(GET_USER) // TODO why is this needed? We already have this information from token

  const [pro, setPro] = useState(false)

  useEffect(() => {
    if (data) {
      stripePromise.then((res) => {
        if (!res) {
          console.error('Error: No response from Stripe')
          return
        }
        res.redirectToCheckout({ sessionId: data.checkout.session })
      })
    }
  }, [data])

  useEffect(() => {
    if (!userLoading && !userError && userData?.getUser) {
      setPro(userData.getUser.pro)
    }
  }, [userLoading, userError, userData])

  return { pro, loggedIn, getCheckout }
}
