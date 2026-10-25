import { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { CHECKOUT, GET_USER } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { loadCheckout, oneAtATime, runCheckout, sessionFrom } from './checkout'
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
  /** A checkout attempt is in flight: Upgrade is disabled until it fails (or Stripe opens). */
  const [checkoutStarting, setCheckoutStarting] = useState(false)
  /** One attempt at a time, kept for the life of the page. */
  const [oneCheckout] = useState(oneAtATime)

  const failed = (step: CheckoutFailure): CheckoutFailure => {
    setCheckoutFailed(true)
    setCheckoutStarting(false)
    return step
  }

  /** A new attempt: a new session and, after a failed load, a new Stripe.js. */
  const attempt = (): Promise<CheckoutFailure> => {
    setCheckoutFailed(false)
    setCheckoutStarting(true)
    return runCheckout(() => getCheckout().then(sessionFrom), load).then(failed)
  }

  /** Each press starts an attempt, unless one is already in flight (then it is a no-op). */
  const startCheckout = (): Promise<CheckoutFailure> => oneCheckout.run(attempt)

  /**
   * Back from Stripe's checkout, the browser may restore this page as it was (back/forward
   * cache), mid-redirect: enable Upgrade again so the user can start over.
   */
  useEffect(() => {
    const restored = (event: PageTransitionEvent): null => {
      if (!event.persisted) return null
      setCheckoutStarting(false)
      return oneCheckout.forget()
    }
    window.addEventListener('pageshow', restored)
    return () => window.removeEventListener('pageshow', restored)
  }, [oneCheckout])

  useEffect(() => {
    if (!userLoading && !userError && userData) {
      setPro(userData.getUser.pro)
    }
  }, [userLoading, userError, userData])

  return {
    pro,
    loggedIn,
    startCheckout,
    cancelled,
    checkoutFailed,
    checkoutStarting
  }
}
