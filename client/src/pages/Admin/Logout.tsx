/* react */
import React, { FC, useEffect, useState } from 'react'

/* state */
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'
import LoginLink from '../../components/Links/LoginLink.tsx'

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
