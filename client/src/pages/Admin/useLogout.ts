import { useEffect, useState } from 'react'
import { useAuthContext } from 'utils/auth/AuthContext'

export const useLogout = () => {
  const [auth, dispatch] = useAuthContext()
  const [m, setM] = useState('Logging out…')
  useEffect(() => {
    dispatch({ type: 'LOGOUT' })
    setM('You have been logged out.')
  }, [dispatch])
  return { loggedIn: auth.loggedIn, m }
}
