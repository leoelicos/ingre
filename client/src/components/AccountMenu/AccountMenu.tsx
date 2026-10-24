import { translate } from '../../i18n'
import type { FC } from 'react'
import type { Key } from 'react-aria-components'
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover
} from 'react-aria-components'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { IngreIconAccount } from '../../lib/icon/Icon'
import type { AccountAction } from './accountItems'
import { SAVED_PATH, accountItems, actionsFor } from './accountItems'

export const ACCOUNT_LABEL = translate('account.label')

const TRIGGER =
  'inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-xl text-text outline-none data-[pressed]:bg-chip-active data-[focus-visible]:focus-ring'

const ITEM =
  'flex min-h-[44px] cursor-pointer items-center rounded-control px-3 text-text outline-none data-[focused]:bg-chip-active data-[focus-visible]:focus-ring'

/**
 * Account icon (#164): a real menu button. React Aria gives it aria-haspopup and aria-expanded,
 * arrow keys between items, and Escape to close with focus back on the icon.
 */
export const AccountMenu: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { handleLogout } = useAuth()
  const from = location.pathname + location.search
  const run: Record<AccountAction, () => void> = {
    login: () => navigate('/login', { state: { from } }),
    signup: () => navigate('/signup', { state: { from } }),
    saved: () => navigate(SAVED_PATH),
    logout: handleLogout
  }
  const onAction = (key: Key) =>
    actionsFor(key).forEach((action) => run[action]())
  return (
    <MenuTrigger>
      <Button
        aria-label={ACCOUNT_LABEL}
        className={TRIGGER}
      >
        <IngreIconAccount />
      </Button>
      <Popover
        placement="bottom end"
        className="min-w-[10rem] rounded-control border border-border bg-surface p-1 shadow-card"
      >
        <Menu
          aria-label={ACCOUNT_LABEL}
          className="outline-none"
          onAction={onAction}
        >
          {accountItems(loggedIn).map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              className={ITEM}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}
