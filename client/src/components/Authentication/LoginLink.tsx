/* takes the user to the login page */

/* react */
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

/* components */
import LoginButton from './LoginButton.tsx'

const LoginLink: FC = () => {
  return (
    <Link to="/login">
      <LoginButton />
    </Link>
  )
}
export default LoginLink
