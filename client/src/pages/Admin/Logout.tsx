import React, { FC, useEffect, useState } from 'react'
import LoginLink from '../../components/Links/LoginLink.tsx'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

const Logout: FC = () => {
  const [state, dispatch] = useAuthContext()
  const loggedIn = state.loggedIn
  if (!loggedIn)
    return (
      <div>
        <div>You are logged out.</div>
        <LoginLink />
      </div>
    )

  const [m, setM] = useState('Logging out…')

  useEffect(() => {
    dispatch({ type: 'LOGOUT' })
    setM('You have been logged out.')
  }, [dispatch])

  return <div>{m}</div>
}

export default Logout
