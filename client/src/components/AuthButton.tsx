import React, { FC } from 'react'
import LoginLink from './LoginLink.tsx'
import LogoutLink from './LogoutLink.tsx'

type AuthButtonType = FC<{ loggedIn: boolean }>

const AuthButton: AuthButtonType = ({ loggedIn }) => {
  return loggedIn ? <LogoutLink /> : <LoginLink />
}
export default AuthButton
