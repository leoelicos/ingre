import { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { CHECKOUT, GET_USER } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { loadCheckout, runCheckout, sessionFrom } from './checkout'
import type { CheckoutFailure, LoadCheckout } from './checkout'

export const useUpgrade = (load: LoadCheckout = loadCheckout) => {
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn

  const [searchParams] = useSearchParams()
  /** Stripe sends a cancelled checkout back here (cancel_url). */
  const cancelled = searchParams.get('checkout') === 'cancelled'

  const [getCheckout] = useLazyQuery(CHECKOUT, { fetchPolicy: 'network-only' })
  const {
    data: userData,
    loading: userLoading,
    error: userError
  } = useQuery(GET_USER) // TODO why is this needed? We already have this information from token

  const [pro, setPro] = useState(false)
  /** Checkout did not open: no session, Stripe.js did not load, or Stripe reported an error. */
  const [checkoutFailed, setCheckoutFailed] = useState(false)

  const failed = (step: CheckoutFailure): CheckoutFailure => {
    setCheckoutFailed(true)
    return step
  }

  /** Each press starts over with a new session and, after a failed load, a new Stripe.js. */
  const startCheckout = (): Promise<CheckoutFailure> => {
    setCheckoutFailed(false)
    return runCheckout(() => getCheckout().then(sessionFrom), load).then(failed)
  }

  useEffect(() => {
    if (!userLoading && !userError && userData) {
      setPro(userData.getUser.pro)
    }
  }, [userLoading, userError, userData])

  return { pro, loggedIn, startCheckout, cancelled, checkoutFailed }
}
