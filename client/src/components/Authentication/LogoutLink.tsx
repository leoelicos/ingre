import React, { FC } from 'react'

import AuthLink from './AuthLink.tsx'

const LogoutLink: FC = () => (
  <AuthLink
    link={'/logout'}
    text="Log out"
  />
)
export default LogoutLink