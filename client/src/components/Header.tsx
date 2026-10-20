import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../utils/auth/AuthContext'
import { IngreIconLogoEgg } from '../lib/icon/Icon'
import { AccountMenu } from './AccountMenu/AccountMenu'
import { HeaderSearch } from './HeaderSearch/HeaderSearch'

export const LOGO_TEXT = 'ingré'

/** The logo: back to the workspace. The wordmark is visible from small tablets up. */
const Logo: FC = () => (
  <Link
    to="/"
    className="flex min-h-[44px] shrink-0 items-center rounded-control no-underline focus-visible:focus-ring"
  >
    <IngreIconLogoEgg />
    <span className="sr-only font-['Poppins'] text-4xl font-extrabold tracking-tighter text-brand sm:not-sr-only">
      {LOGO_TEXT}
    </span>
  </Link>
)

/** One header everywhere (#164): only the logo, search and the account menu. */
export const Header: FC = () => {
  const [auth] = useAuthContext()
  return (
    <header className="ingre-navbar">
      <div className="ingre-page flex items-center gap-2 py-2 sm:gap-4 sm:py-3">
        <Logo />
        <HeaderSearch />
        <AccountMenu loggedIn={auth.loggedIn} />
      </div>
    </header>
  )
}
