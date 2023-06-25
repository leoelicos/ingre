import React, { FC } from 'react'

import AuthLink from './AuthLink.tsx'

const LoginButton: FC = () => (
  <AuthLink
    link={'/login'}
    text="Log in"
  />
)
export default LoginButton
