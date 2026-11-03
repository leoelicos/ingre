/** What each account menu item does. */
import { translate } from '../../i18n'

export type AccountAction = 'login' | 'signup' | 'saved' | 'transfer' | 'logout'

export interface AccountItem {
  readonly id: AccountAction
  readonly label: string
}

const SIGNED_OUT: readonly AccountItem[] = [
  { id: 'login', label: translate('account.logIn') },
  { id: 'signup', label: translate('account.signUp') },
  { id: 'transfer', label: translate('account.transfer') }
]

const SIGNED_IN: readonly AccountItem[] = [
  { id: 'saved', label: translate('account.saved') },
  { id: 'transfer', label: translate('account.transfer') },
  { id: 'logout', label: translate('account.logOut') }
]

/** Signed out: Log in, Sign up and Import and export. Signed in: Saved, Import and export and Log out. */
export const accountItems = (loggedIn: boolean): readonly AccountItem[] =>
  loggedIn ? SIGNED_IN : SIGNED_OUT

const ACTIONS: readonly AccountAction[] = [
  'login',
  'signup',
  'saved',
  'transfer',
  'logout'
]

/** The action for a menu key, as a list: one action, or none for anything unknown. */
export const actionsFor = (key: unknown): AccountAction[] =>
  ACTIONS.filter((action) => action === key)

/** Import and export (#230): its own page. */
export const TRANSFER_PATH = '/transfer'

/** Saved is a filter on the recipe rows (#160, #179), not a page. */
export const SAVED_PATH = '/?saved=1'
