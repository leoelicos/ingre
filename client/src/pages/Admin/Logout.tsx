/* react */
import React, { FC, useEffect, useState } from 'react'

/* auth */
import Auth from '../../utils/auth/auth.ts'

const Logout: FC = () => {
  const [logoutMessage, setLogoutMessage] = useState(() => {
    if (!Auth.loggedIn()) {
      return 'You are already logged out.'
    }
    return 'Logging out...'
  })

  useEffect(() => {
    const init = async () => {
      try {
        await Auth.logout()
        setLogoutMessage('You have been logged out.')
      } catch (error) {
        setLogoutMessage('Unable to log out. Please try again.')
      }
    }

    init()
  }, [])

  return <div>{logoutMessage}</div>
}

export default Logout
