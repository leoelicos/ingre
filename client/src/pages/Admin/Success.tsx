import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import NotLoggedIn from 'components/NotLoggedIn'
import { IngreIconPro } from 'lib/icon/Icon'
import { useSuccess } from './useSuccess'

export const Success: FC = () => {
  const { loggedIn, Token, searchParams } = useSuccess()
  if (!loggedIn) return <NotLoggedIn />
  if (!searchParams.get('session_id')) {
    return (
      <div>
        <div>Payment error</div>
        <div>
          <button>
            <Link to="/upgrade">
              <IngreIconPro />
              Try again?
            </Link>
          </button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <p>Success!</p>
      <ul>
        <li>Thank you for your purchase!</li>
        <li>
          Your purchase reference is <Token />
        </li>
        <li>You will now be redirected to the home page.</li>
      </ul>
    </div>
  )
}
