import React, { FC } from 'react'

import AuthLink from './AuthLink.tsx'

const LogoutButton: FC = () => (
  <AuthLink
    link={'/logout'}
    text="Log out"
  />
)
export default LogoutButton
