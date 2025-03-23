import React, { FC } from 'react'
import NotLoggedIn from 'components/NotLoggedIn'
import { IngreIconPro } from 'lib/icon/Icon'
import { useUpgrade } from './useUpgrade'

const exampleCookingInstructionURL =
  'https://www.edamam.com/results/recipe/?recipe=healthy-persian-love-cake-recipe-1d81f64f756c268979d9c863403b32d3/-'

export const Upgrade: FC = () => {
  const { pro, loggedIn, getCheckout } = useUpgrade()
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
            <p>Try it out!</p>
            <p>Cooking instructions</p>
            <button>
              <a
                href={exampleCookingInstructionURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IngreIconPro />
              </a>
            </button>
          </li>
          <li>Only 5 USD</li>
          <li>Secure payment with Stripe</li>
        </ul>
      </div>
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
