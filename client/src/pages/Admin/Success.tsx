import { useT } from '../../i18n'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import NotLoggedIn from '../../components/NotLoggedIn'
import { IngreIconPro } from '../../lib/icon/Icon'
import { useSuccess } from './useSuccess'

export const Success: FC = () => {
  const t = useT()
  const navigate = useNavigate()
  const { loggedIn, Token, searchParams } = useSuccess()
  if (!loggedIn) return <NotLoggedIn />
  if (!searchParams.get('session_id')) {
    return (
      <div>
        <div>{t('success.paymentError')}</div>
        <div>
          {/* one control, not a link inside a button, and at least 24px to hit (#106) */}
          <button
            type="button"
            className="min-h-[24px] min-w-[24px] focus-visible:focus-ring"
            onClick={() => navigate('/upgrade')}
          >
            <IngreIconPro />
            {t('success.tryAgain')}
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
