import React, { FC, useEffect, useState } from 'react'
import LoginLink from '../../components/Links/LoginLink.tsx'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

const Logout: FC = () => {
  const [auth, dispatch] = useAuthContext()

  const [m, setM] = useState('Logging out…')

  useEffect(() => {
    dispatch({ type: 'LOGOUT' })
    setM('You have been logged out.')
  }, [dispatch])

  if (!auth.loggedIn)
    return (
      <div>
        <div>You are logged out.</div>
        <LoginLink />
      </div>
    )

  return <div>{m}</div>
}

export default Logout
