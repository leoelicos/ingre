import React from 'react'
import { useAuth } from 'hooks/useAuth'
import { Button, Link } from 'lib/components'

export const AuthButton = ({ loggedIn }: { loggedIn: boolean }) => {
  const { handleLogout } = useAuth()
  return loggedIn ? (
    <Button onClick={handleLogout}>Log&nbsp;out</Button>
  ) : (
    <Link to="/login">Log&nbsp;in</Link>
  )
}
