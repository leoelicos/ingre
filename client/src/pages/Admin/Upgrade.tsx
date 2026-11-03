import { useT } from '../../i18n'
import type { FC } from 'react'
import NotLoggedIn from '../../components/NotLoggedIn'
import { PrimaryButton } from '../../components/PrimaryButton'
import { Plans } from '../../components/Plans/Plans'
import { useFlag } from '../../utils/flags/useFlag'
import { useUpgrade } from './useUpgrade'

/** With the tiers flag on (#208), /upgrade is the Plans page; otherwise the old PRO upgrade. */
export const Upgrade: FC = () => {
  const tiers = useFlag('tiers')
  return tiers ? <Plans /> : <ProUpgrade />
}

const ProUpgrade: FC = () => {
  const t = useT()
  const {
    pro,
    loggedIn,
    startCheckout,
    cancelled,
    checkoutFailed,
    checkoutStarting
  } = useUpgrade()
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
      {checkoutStarting && <p role="status">{t('upgrade.starting')}</p>}
      {/* aria-disabled while starting, not disabled: it keeps focus and is announced as dimmed */}
      <PrimaryButton
        onPress={() => {
          void startCheckout()
        }}
        ariaDisabledOnly={checkoutStarting}
      >
        {t('upgrade.checkout')}
      </PrimaryButton>
    </div>
  )
}

export default Upgrade
