import { useEffect, useState } from 'react'
import type { CheckoutQuote, PaddleCheckout } from '../../utils/payments/paddle'
import { previewPrice } from '../../utils/payments/paddle'

export type QuoteState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'failed' }
  | { readonly status: 'ready'; readonly quote: CheckoutQuote }

/** Paddle + RevenueCat: Paddle's price and tax for one price in one country. */
export const useQuote = (
  paddle: PaddleCheckout | null,
  priceId: string | null,
  country: string
) => {
  const [state, setState] = useState<QuoteState>({ status: 'idle' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (paddle === null || priceId === null) {
      setState({ status: 'idle' })
      return undefined
    }
    let live = true
    setState({ status: 'loading' })
    previewPrice(paddle, priceId, country)
      .then((quote) => {
        if (live)
          setState(
            quote === null ? { status: 'failed' } : { status: 'ready', quote }
          )
      })
      .catch(() => {
        if (live) setState({ status: 'failed' })
      })
    return () => {
      live = false
    }
  }, [paddle, priceId, country, attempt])
  const retry = (): void => setAttempt((n) => n + 1)
  return { state, retry }
}
