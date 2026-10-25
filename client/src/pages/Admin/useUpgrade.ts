import { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js/pure'
import type { Stripe } from '@stripe/stripe-js'
import { CHECKOUT, GET_USER } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from '../../utils/auth/AuthContext'

const STRIPE_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx'

/** The part of Stripe.js the upgrade uses. */
export type CheckoutRedirect = Pick<Stripe, 'redirectToCheckout'>

/** Loads Stripe.js when checkout starts, not when the module is imported (the /pure entry
    injects the script on the first call, where the main entry injects it on import). */
export const loadCheckout = (): Promise<CheckoutRedirect | null> =>
  loadStripe(STRIPE_KEY)

export const useUpgrade = (load: typeof loadCheckout = loadCheckout) => {
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn

  const [searchParams] = useSearchParams()
  /** Stripe sends a cancelled checkout back here (cancel_url). */
  const cancelled = searchParams.get('checkout') === 'cancelled'

  const [getCheckout, { data, error: checkoutError }] = useLazyQuery(CHECKOUT, {
    fetchPolicy: 'network-only'
    // nextFetchPolicy: 'cache-first'
  })
  const {
    data: userData,
    loading: userLoading,
    error: userError
  } = useQuery(GET_USER) // TODO why is this needed? We already have this information from token

  const [pro, setPro] = useState(false)
  /** Stripe.js did not load (the script failed or gave no Stripe): checkout never started. */
  const [stripeFailed, setStripeFailed] = useState(false)

  useEffect(() => {
    if (data) {
      const fail = () => setStripeFailed(true)
      load().then((stripe) => {
        if (stripe === null) fail()
        else stripe.redirectToCheckout({ sessionId: data.checkout.session })
      }, fail)
    }
  }, [data, load])

  useEffect(() => {
    if (!userLoading && !userError && userData) {
      setPro(userData.getUser.pro)
    }
  }, [userLoading, userError, userData])

  return {
    pro,
    loggedIn,
    getCheckout,
    cancelled,
    checkoutFailed: checkoutError !== undefined || stripeFailed
  }
}
