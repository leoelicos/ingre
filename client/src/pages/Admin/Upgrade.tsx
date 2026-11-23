import { useQuery } from '@apollo/client'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import NotLoggedIn from '../../components/NotLoggedIn'
import { Plans } from '../../components/Plans/Plans'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useT } from '../../i18n'
import { GET_USER } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { useFlag } from '../../utils/flags/useFlag'

/** With the tiers flag on (#208), /upgrade is the Plans page; otherwise the old PRO upgrade. */
export const Upgrade: FC = () => {
  const tiers = useFlag('tiers')
  return tiers ? <Plans /> : <ProUpgrade />
}

const ProUpgrade: FC = () => {
  const t = useT()
  const navigate = useNavigate()
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn
  const {
    data: userData,
    loading: userLoading,
    error: userError
  } = useQuery(GET_USER)
  const pro = !userLoading && !userError && userData?.getUser.pro === true
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
      <PrimaryButton
        onPress={() => {
          void navigate('/checkout')
        }}
      >
        {t('upgrade.checkout')}
      </PrimaryButton>
    </div>
  )
}

export default Upgrade
