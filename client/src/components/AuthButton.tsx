import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Link } from '../lib/components'

export const AuthButton = ({ loggedIn }: { loggedIn: boolean }) => {
  const { handleLogout } = useAuth()
  const location = useLocation()
  return loggedIn ? (
    <Button onClick={handleLogout}>Log&nbsp;out</Button>
  ) : (
    <Link
      to="/login"
      state={{ from: location.pathname + location.search }}
      className="ingre-btn-outline"
    >
      Log&nbsp;in
    </Link>
  )
}
