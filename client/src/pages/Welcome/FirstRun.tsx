import type { FC, ReactNode } from 'react'
import { PageMain } from '../../components/SkipLink'
import { useLocation } from 'react-router-dom'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { useFirstRun } from '../../utils/firstRun/firstRun'
import { Landing } from './Landing'
import { Tmd } from './Tmd'

/** Signing in and up are open to everyone, so a returning user can get in on a new device. */
const AUTH_PATHS: readonly string[] = ['/login', '/signup']

/**
 * The first visit (#211): until it has been through, the whole app is this: Landing, then the
 * three TMD questions, then whatever was asked for. A return visit, a signed-in user and
 * the Log in and Sign up pages go straight in.
 */
export const FirstRun: FC<{ children: ReactNode }> = ({ children }) => {
  const { stage, goTo } = useFirstRun()
  const [{ loggedIn }] = useAuthContext()
  const { pathname } = useLocation()
  if (stage === 'done' || loggedIn || AUTH_PATHS.includes(pathname))
    return <>{children}</>
  return (
    <PageMain>
      {stage === 'landing' ? (
        <Landing onStart={() => goTo('tmd')} />
      ) : (
        <Tmd onDone={() => goTo('done')} />
      )}
    </PageMain>
  )
}
