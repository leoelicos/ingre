import { useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect } from 'react'
import { Button } from 'react-aria-components'
import { Link, useLocation } from 'react-router-dom'
import { PageMain } from '../../components/SkipLink'
import { SAVED_PATH } from '../../components/AccountMenu/accountItems'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import { library } from '../../utils/library/recipeLibrary'
import { useSaved } from '../../utils/saved/useSaved'
import { LanguageSection } from './LanguageSection'
import { PreferencesForm } from './PreferencesForm'

const LINK =
  'inline-flex min-h-[44px] items-center rounded-control px-3 font-semibold text-primary underline focus-visible:focus-ring'
const BUTTON =
  'inline-flex min-h-[44px] items-center rounded-pill border border-border bg-surface px-4 font-semibold text-text data-[focus-visible]:focus-ring'
const CARD = 'flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card'
const HEADING = 'm-0 text-xl font-semibold text-text'

/** The saved recipes' names, in library order. */
export const savedNames = (ids: ReadonlySet<string>): string[] =>
  library.filter((recipe) => ids.has(recipe.id)).map((recipe) => recipe.name)

const Account: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
  const t = useT()
  const { handleLogout } = useAuth()
  const from = useLocation().pathname
  return (
    <section
      aria-labelledby="profile-account"
      className={CARD}
    >
      <h2
        id="profile-account"
        className={HEADING}
      >
        {t('profile.account')}
      </h2>
      {loggedIn ? (
        <>
          <p className="m-0 text-text">{t('profile.signedInHint')}</p>
          <div>
            <Button
              onPress={handleLogout}
              className={BUTTON}
            >
              {t('account.logOut')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="m-0 text-text">{t('profile.signedOutHint')}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/login"
              state={{ from }}
              className={LINK}
            >
              {t('account.logIn')}
            </Link>
            <Link
              to="/signup"
              state={{ from }}
              className={LINK}
            >
              {t('account.signUp')}
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

const Saved: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
  const t = useT()
  const names = savedNames(useSaved(loggedIn).ids)
  return (
    <section
      aria-labelledby="profile-saved"
      className={CARD}
    >
      <h2
        id="profile-saved"
        className={HEADING}
      >
        {t('profile.saved')}
      </h2>
      {!loggedIn && <p className="m-0 text-text">{t('profile.savedLogin')}</p>}
      {loggedIn && names.length === 0 && (
        <p className="m-0 text-text">{t('profile.savedNone')}</p>
      )}
      {names.length > 0 && (
        <>
          <p className="m-0 text-text">
            {t('profile.savedCount', { count: names.length })}
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0 text-text">
            {names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <div>
            <Link
              to={SAVED_PATH}
              className={LINK}
            >
              {t('profile.savedOpen')}
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

/**
 * Profile (#227): the fourth tab. Your account, and your saved recipes and any other collections
 * under it, instead of tabs of their own; then the app's preferences, kept on this device.
 */
export const ProfilePage: FC = () => {
  const t = useT()
  useEffect(() => changeTitle(t('profile.title')), [t])
  const loggedIn = useAuthContext()[0].loggedIn
  return (
    <PageMain className="mx-auto flex w-full max-w-layout flex-col gap-6 px-gutter pb-8 pt-4">
      <h1 className="m-0 text-2xl font-semibold text-text">
        {t('profile.title')}
      </h1>
      <Account loggedIn={loggedIn} />
      <Saved loggedIn={loggedIn} />
      <LanguageSection />
      <PreferencesForm />
    </PageMain>
  )
}
