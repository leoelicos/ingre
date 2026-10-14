import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Link } from '../lib/components'

export const AuthButton = ({
  loggedIn,
  onNavigate
}: {
  loggedIn: boolean
  onNavigate?: () => void
}) => {
  const { handleLogout } = useAuth()
  const location = useLocation()
  const close = () => onNavigate?.()
  return loggedIn ? (
    <Button
      onClick={() => {
        close()
        handleLogout()
      }}
    >
      Log&nbsp;out
    </Button>
  ) : (
    <Link
      to="/login"
      state={{ from: location.pathname + location.search }}
      className="ingre-btn-outline"
      onClick={close}
    >
      Log&nbsp;in
    </Link>
  )
}
