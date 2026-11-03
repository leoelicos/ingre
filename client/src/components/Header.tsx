import type { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../utils/auth/AuthContext'
import { IngreIconLogoEgg } from '../lib/icon/Icon'
import { AccountMenu } from './AccountMenu/AccountMenu'
import { SearchBox } from './SearchBox/SearchBox'

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

/**
 * One header everywhere (#164, #192): the logo and the account menu. On the workspace,
 * search lives in discovery, not the header. Other pages keep the search bar, which
 * returns you to the list.
 */
export const Header: FC = () => {
  const [auth] = useAuthContext()
  const onList = useLocation().pathname === '/'
  return (
    <header className="ingre-navbar">
      <div className="ingre-page flex items-center gap-2 py-2 sm:gap-4 sm:py-3">
        <Logo />
        <div className="flex min-w-0 flex-1">{!onList && <SearchBox />}</div>
        <AccountMenu loggedIn={auth.loggedIn} />
      </div>
    </header>
  )
}
