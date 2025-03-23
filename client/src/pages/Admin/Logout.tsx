import React, { FC } from 'react'
import LoginLink from 'components/LoginLink'
import { useLogout } from './useLogout'

export const Logout: FC = () => {
  const { loggedIn, m } = useLogout()
  if (!loggedIn)
    return (
      <div>
        <div>You are logged out.</div>
        <LoginLink />
      </div>
    )
  return <div>{m}</div>
}
