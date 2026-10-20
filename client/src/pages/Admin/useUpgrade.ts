import { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import { CHECKOUT, GET_USER } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from '../../utils/auth/AuthContext'

const STRIPE_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx'

/** The part of Stripe.js the upgrade uses. */
export type CheckoutRedirect = Pick<Stripe, 'redirectToCheckout'>

/** Loads Stripe.js when checkout starts, not when the module is imported. */
export const loadCheckout = (): Promise<CheckoutRedirect | null> =>
  loadStripe(STRIPE_KEY)

export const useUpgrade = (load: typeof loadCheckout = loadCheckout) => {
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
      load().then((res) => {
        if (!res) {
          console.error('Error: No response from Stripe')
          return
        }
        res.redirectToCheckout({ sessionId: data.checkout.session })
      })
    }
  }, [data, load])

  useEffect(() => {
    if (!userLoading && !userError && userData) {
      setPro(userData.getUser.pro)
    }
  }, [userLoading, userError, userData])

  return { pro, loggedIn, getCheckout }
}
