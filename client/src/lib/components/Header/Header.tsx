import { useState, useEffect, useRef } from 'react'
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
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="ingre-navbar">
      <div className="ingre-page flex flex-wrap items-center justify-between py-3">
        <Link
          to="/"
          className="flex items-center gap-2 no-underline focus-visible:focus-ring"
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
          ref={menuButtonRef}
          type="button"
          className="md:hidden min-h-[44px] min-w-[44px] border border-border rounded-control bg-transparent focus-visible:focus-ring"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <LogoCollapsed />
        </button>
        <nav
          id="main-nav"
          className={`${
            open ? 'flex' : 'hidden'
          } md:flex flex-col md:flex-row basis-full md:basis-auto w-full md:w-auto bg-bg md:bg-transparent z-20 px-4 py-3 md:p-0 items-center justify-center gap-3`}
        >
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="no-underline text-text hover:text-primary focus-visible:focus-ring"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <AuthButton
            loggedIn={loggedIn}
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </div>
    </header>
  )
}
