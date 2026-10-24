import { useT } from '../../i18n'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import NotLoggedIn from '../../components/NotLoggedIn'
import { IngreIconPro } from '../../lib/icon/Icon'
import { useSuccess } from './useSuccess'

export const Success: FC = () => {
  const t = useT()
  const { loggedIn, Token, searchParams } = useSuccess()
  if (!loggedIn) return <NotLoggedIn />
  if (!searchParams.get('session_id')) {
    return (
      <div>
        <div>{t('success.paymentError')}</div>
        <div>
          <button>
            <Link to="/upgrade">
              <IngreIconPro />
              {t('success.tryAgain')}
            </Link>
          </button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <p>{t('success.title')}</p>
      <ul>
        <li>{t('success.thanks')}</li>
        <li>
          {t('success.reference')} <Token />
        </li>
        <li>{t('success.redirect')}</li>
      </ul>
    </div>
  )
}
