import React, { FC } from 'react'

import AuthLink from './AuthLink.tsx'

const LoginLink: FC = () => (
  <AuthLink
    link={'/login'}
    text="Log in"
  />
)
export default LoginLink
