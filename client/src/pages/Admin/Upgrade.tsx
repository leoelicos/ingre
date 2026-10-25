import { useT } from '../../i18n'
import type { FC } from 'react'
import NotLoggedIn from '../../components/NotLoggedIn'
import { useUpgrade } from './useUpgrade'

export const Upgrade: FC = () => {
  const t = useT()
  const { pro, loggedIn, startCheckout, cancelled, checkoutFailed } =
    useUpgrade()
  if (pro) return <p>{t('upgrade.pro')}</p>
  if (!loggedIn)
    return (
      <>
        <p>{t('upgrade.title')}</p>
        <NotLoggedIn />
      </>
    )
  return (
    <div>
      <div>
        <p>{t('upgrade.title')}</p>
      </div>
      <div>
        <p>{t('upgrade.why')}</p>
        <ul>
          <li>
            <p>{t('upgrade.instructions')}</p>
          </li>
          <li>{t('upgrade.price')}</li>
          <li>{t('upgrade.secure')}</li>
        </ul>
      </div>
      {cancelled && <p role="status">{t('upgrade.cancelled')}</p>}
      {checkoutFailed && <p role="alert">{t('upgrade.failed')}</p>}
      <button
        onClick={() => {
          void startCheckout()
        }}
      >
        {t('upgrade.checkout')}
      </button>
    </div>
  )
}

export default Upgrade
