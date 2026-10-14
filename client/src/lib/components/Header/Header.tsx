import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthButton } from '../../../components/AuthButton'

export const Header: React.FC<{
  Logo: React.FC
  LogoCollapsed: React.FC
  logoText: string
  links: Array<{ to: string; label: string }>
  loggedIn: boolean
}> = ({ Logo, logoText, LogoCollapsed, links, loggedIn }) => {
  const [open, setOpen] = useState(false)
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
        <button
          type="button"
          className="lg:hidden min-h-[44px] min-w-[44px] border-0 bg-transparent"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <LogoCollapsed />
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
        <nav
          id="main-nav"
          className={`${
            open ? 'flex' : 'hidden'
          } lg:flex flex-col lg:flex-row absolute lg:static top-16 left-0 right-0 bg-bg lg:bg-transparent z-20 px-4 py-2 lg:p-0 items-start lg:items-center gap-3`}
        >
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="no-underline text-text hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <AuthButton loggedIn={loggedIn} />
        </nav>
      </div>
    </header>
  )
}
