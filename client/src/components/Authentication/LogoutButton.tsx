import React, { FC } from 'react'

import AuthButton from './AuthButton.tsx'
import AuthLink from './AuthLink.tsx'

const LogoutButton: FC = () => {
  console.log('logoutbuttonclicked')
  return (
    <AuthLink link={'/logout'}>
      <AuthButton>Log out</AuthButton>
    </AuthLink>
  )
}
export default LogoutButton
