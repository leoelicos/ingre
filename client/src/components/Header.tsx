import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { translate } from '../i18n'
import { useAuthContext } from '../utils/auth/AuthContext'
import { IngreIconLogoEgg } from '../lib/icon/Icon'
import { AccountMenu } from './AccountMenu/AccountMenu'

export const LOGO_TEXT = 'ingré'

/** The logo: back to the workspace. The wordmark is visible from small tablets up; below that the egg alone is still a 44px target (#296). */
const Logo: FC = () => (
  <Link
    to="/"
    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-control no-underline focus-visible:focus-ring"
  >
    <IngreIconLogoEgg />
    <span className="sr-only font-['Poppins'] text-[26px] font-normal tracking-[-0.03em] text-text sm:not-sr-only">
      {LOGO_TEXT}
    </span>
  </Link>
)

/** The War room button (#207): opens the capture feature; it is not one of the Explore modes. */
export const WAR_ROOM_PATH = '/war-room'

const WarRoomLink: FC = () => (
  <Link
    to={WAR_ROOM_PATH}
    className="ml-auto flex min-h-[44px] shrink-0 items-center rounded-control px-2 text-sm font-semibold text-primary no-underline focus-visible:focus-ring"
  >
    {translate('warRoom.open')}
  </Link>
)

/**
 * One header everywhere (#164): the logo, the War room button (#207) and the account menu.
 * Search left the header with #192: it sits at the top of the discovery sheet, opened from the
 * + Recipe button or the Explore tab. The header sticks to the top (#228). On Android it reaches
 * up behind the status bar and pads its content below it with the top safe-area inset (#296).
 */
export const Header: FC = () => {
  const [auth] = useAuthContext()
  return (
    <header className="ingre-navbar sticky top-0 z-30 -mt-[var(--safe-top)] bg-bg pt-[var(--safe-top)]">
      <div className="ingre-page flex items-center gap-2 py-2 sm:gap-4 sm:py-3">
        <Logo />
        <WarRoomLink />
        <AccountMenu loggedIn={auth.loggedIn} />
      </div>
    </header>
  )
}
