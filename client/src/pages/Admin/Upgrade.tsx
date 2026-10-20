import type { FC } from 'react'
import NotLoggedIn from '../../components/NotLoggedIn'
import { useUpgrade } from './useUpgrade'

export const Upgrade: FC = () => {
  const { pro, loggedIn, getCheckout, cancelled, checkoutFailed } = useUpgrade()
  if (pro) return <p>You are pro</p>
  if (!loggedIn)
    return (
      <>
        <p>Upgrade</p>
        <NotLoggedIn />
      </>
    )
  return (
    <div>
      <div>
        <p>Upgrade</p>
      </div>
      <div>
        <p>Why upgrade?</p>
        <ul>
          <li>
            <p>
              Get an extra button that opens cooking instructions for each
              recipe
            </p>
          </li>
          <li>Only 5 USD</li>
          <li>Secure payment with Stripe</li>
        </ul>
      </div>
      {cancelled && (
        <p role="status">
          Checkout cancelled. You have not been charged and your account is
          unchanged.
        </p>
      )}
      {checkoutFailed && (
        <p role="alert">
          We couldn&apos;t start the Stripe checkout. You have not been charged.
          Please try again.
        </p>
      )}
      <button
        onClick={() => {
          getCheckout()
        }}
      >
        Checkout with Stripe
      </button>
    </div>
  )
}

export default Upgrade
