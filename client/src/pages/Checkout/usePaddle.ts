import { useEffect, useState } from 'react'
import type { PaddleConfig } from '../../utils/payments/config'
import type { LoadPaddle, PaddleCheckout } from '../../utils/payments/paddle'

export type PaddleState =
  | { readonly status: 'off' }
  | { readonly status: 'loading' }
  | { readonly status: 'failed' }
  | { readonly status: 'ready'; readonly paddle: PaddleCheckout }

/**
 * Paddle + RevenueCat: loads Paddle.js when checkout is set up. `completed` turns true
 * when Paddle's overlay reports a finished checkout.
 */
export const usePaddle = (config: PaddleConfig | null, load: LoadPaddle) => {
  const [state, setState] = useState<PaddleState>(
    config === null ? { status: 'off' } : { status: 'loading' }
  )
  const [completed, setCompleted] = useState(false)
  useEffect(() => {
    if (config === null) return undefined
    let live = true
    load(config, (event) => {
      if (event.name === 'checkout.completed') setCompleted(true)
    })
      .then((paddle) => {
        if (live)
          setState(
            paddle === undefined
              ? { status: 'failed' }
              : { status: 'ready', paddle }
          )
      })
      .catch(() => {
        if (live) setState({ status: 'failed' })
      })
    return () => {
      live = false
    }
  }, [config, load])
  return { state, completed }
}
