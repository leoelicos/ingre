import type { FC } from 'react'
import { useAuthContext } from '../utils/auth/AuthContext'
import { IngreIconLogoEgg, IngreIconLogoMenuCollapsed } from '../lib/icon/Icon'
import {
  IngreIconIngredients,
  IngreIconRecipe,
  IngreIconSave
} from '../lib/icon/Icon'
import { Header as LibHeader } from '../lib/components/index'

const links = [
  { to: '/', icon: <IngreIconRecipe />, label: 'Pick' },
  { to: '/saved', icon: <IngreIconSave />, label: 'Saved' },
  {
    to: '/ingredients',
    icon: <IngreIconIngredients />,
    label: 'Shopping list'
  }
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
