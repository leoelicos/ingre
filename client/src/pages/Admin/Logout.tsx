/* react */
import React, { FC, useEffect, useState } from 'react'

/* state */
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

const Logout: FC = () => {
  const [state, dispatch] = useAuthContext()
  const loggedIn = state.loggedIn
  if (!loggedIn) return <div>You are already logged out.</div>

  const [m, setM] = useState('Logging out…')

  useEffect(() => {
    dispatch({ type: 'LOGOUT' })
    setM('You have been logged out.')
  }, [])

  return <div>{m}</div>
}

export default Logout
