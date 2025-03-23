import React, { FC } from 'react'
import LoginLink from './LoginLink.tsx'

const NotLoggedIn: FC = () => {
  return (
    <div>
      <div>You need to be logged in to see this page.</div>
      <LoginLink />
    </div>
  )
}

export default NotLoggedIn
