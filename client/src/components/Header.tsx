import type { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../utils/auth/AuthContext'
import { IngreIconLogoEgg } from '../lib/icon/Icon'
import { AccountMenu } from './AccountMenu/AccountMenu'
import { SearchBox } from './SearchBox/SearchBox'
import { DRAWER_MIN_WIDTH, useMinWidth } from '../utils/media/useMinWidth'

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
 * One header everywhere (#164): the logo, search and the account menu. On the list page from
 * 1328px the search bar lives in the Explore drawer (or the 33/33/33 Explore column) instead
 * (#181); below that it stays here.
 */
export const Header: FC = () => {
  const [auth] = useAuthContext()
  const onList = useLocation().pathname === '/'
  const inDrawer = useMinWidth(DRAWER_MIN_WIDTH) && onList
  return (
    <header className="ingre-navbar">
      <div className="ingre-page flex items-center gap-2 py-2 sm:gap-4 sm:py-3">
        <Logo />
        <div className="flex min-w-0 flex-1">{!inDrawer && <SearchBox />}</div>
        <AccountMenu loggedIn={auth.loggedIn} />
      </div>
    </header>
  )
}
