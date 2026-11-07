/** What each account menu item does. */
import { translate } from '../../i18n'

export type AccountAction =
  | 'login'
  | 'signup'
  | 'saved'
  | 'setup'
  | 'plans'
  | 'logout'

export interface AccountItem {
  readonly id: AccountAction
  readonly label: string
}

const SIGNED_OUT: readonly AccountItem[] = [
  { id: 'login', label: translate('account.logIn') },
  { id: 'signup', label: translate('account.signUp') },
  { id: 'setup', label: translate('account.setup') }
]

const SIGNED_IN: readonly AccountItem[] = [
  { id: 'saved', label: translate('account.saved') },
  { id: 'setup', label: translate('account.setup') },
  { id: 'logout', label: translate('account.logOut') }
]

/** Plans (#208): only once the upsell is allowed. */
const PLANS: AccountItem = { id: 'plans', label: translate('account.plans') }

/**
 * Signed out: Log in, Sign up and Set-up. Signed in: Saved, Set-up and Log out.
 * With `plans` (the tiers flag, after the first end-to-end), Plans too, before Log out
 * so Log out stays last.
 */
export const accountItems = (
  loggedIn: boolean,
  plans: boolean = false
): readonly AccountItem[] => {
  if (!plans) return loggedIn ? SIGNED_IN : SIGNED_OUT
  return loggedIn
    ? [...SIGNED_IN.slice(0, -1), PLANS, ...SIGNED_IN.slice(-1)]
    : [...SIGNED_OUT, PLANS]
}

const ACTIONS: readonly AccountAction[] = [
  'login',
  'signup',
  'saved',
  'setup',
  'plans',
  'logout'
]

/** The action for a menu key, as a list: one action, or none for anything unknown. */
export const actionsFor = (key: unknown): AccountAction[] =>
  ACTIONS.filter((action) => action === key)

/** Set-up is the three TMD questions again (#211). */
export const SETUP_PATH = '/setup'

/** Saved is a filter on the recipe rows (#160, #179), not a page. */
export const SAVED_PATH = '/?saved=1'

/** Plans are the Upgrade page (#208). */
export const PLANS_PATH = '/upgrade'
