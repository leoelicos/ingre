import { Link } from 'react-router-dom'
import { AuthButton } from '../../../components/AuthButton'

export const Header: React.FC<{
  Logo: React.FC
  LogoCollapsed: React.FC
  logoText: string
  links: Array<{ to: string; label: string }>
  loggedIn: boolean
}> = ({ Logo, logoText, LogoCollapsed, links, loggedIn }) => {
  return (
    <header className="ingre-navbar">
      <div className="ingre-page flex items-center justify-between py-3">
        <Link
          to="/"
          className="flex items-center gap-2 no-underline"
        >
          <Logo />
          <span
            style={{
              color: 'var(--color-brand)',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '36px',
              letterSpacing: -1,
              fontWeight: '800'
            }}
          >
            {logoText}
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="no-underline text-text hover:text-primary"
            >
              {label}
            </Link>
          ))}
          <AuthButton loggedIn={loggedIn} />
        </nav>
        {/* Collapsed logo kept for potential future mobile toggle; currently unused visually */}
        <span className="sr-only">
          <LogoCollapsed />
        </span>
      </div>
    </header>
  )
}
