import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'

export const AuthButton = ({ loggedIn }: { loggedIn: boolean }) => {
  const { handleLogout } = useAuth()
  return loggedIn ? (
    <button onClick={handleLogout}>Log&nbsp;out</button>
  ) : (
    <Link to="/login">Log&nbsp;in</Link>
  )
}
