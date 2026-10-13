import { useAuth } from '../hooks/useAuth'
import { Button, Link } from '../lib/components'

export const AuthButton = ({ loggedIn }: { loggedIn: boolean }) => {
  const { handleLogout } = useAuth()
  return loggedIn ? (
    <Button onClick={handleLogout}>Log&nbsp;out</Button>
  ) : (
    <Link
      to="/login"
      className="ingre-btn-outline"
    >
      Log&nbsp;in
    </Link>
  )
}
