import React, { FC } from 'react'

import AuthButton from './AuthButton.tsx'
import AuthLink from './AuthLink.tsx'

const LoginButton: FC = () => {
  return (
    <AuthLink link={'/login'}>
      <AuthButton>Log in</AuthButton>
    </AuthLink>
  )
}
export default LoginButton
