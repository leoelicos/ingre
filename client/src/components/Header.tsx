import type { FC } from 'react'
import { useAuthContext } from '../utils/auth/AuthContext'
import { IngreIconLogoEgg, IngreIconLogoMenuCollapsed } from '../lib/icon/Icon'
import {
  IngreIconIngredients,
  IngreIconPro,
  IngreIconSave,
  IngreIconSearch,
  IngreIconTapOff
} from '../lib/icon/Icon'
import { Header as LibHeader } from '../lib/components/index'

const links = [
  { to: '/search', icon: <IngreIconSearch />, label: 'Search' },
  { to: '/saved', icon: <IngreIconSave />, label: 'Saved' },
  {
    to: '/ingredients',
    icon: <IngreIconIngredients />,
    label: 'Shopping list'
  },
  { to: '/tapoff', icon: <IngreIconTapOff />, label: 'Tap Off' },
  { to: '/upgrade', icon: <IngreIconPro />, label: 'PRO' }
]

export const Header: FC = () => {
  const [auth] = useAuthContext()

  return (
    <LibHeader
      logoText="ingré"
      Logo={IngreIconLogoEgg}
      LogoCollapsed={IngreIconLogoMenuCollapsed}
      links={links}
      loggedIn={auth.loggedIn}
    />
  )
}
