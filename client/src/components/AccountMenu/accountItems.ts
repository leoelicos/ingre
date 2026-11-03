/** What each account menu item does. */
import { translate } from '../../i18n'

export type AccountAction = 'login' | 'signup' | 'saved' | 'plans' | 'logout'

export interface AccountItem {
  readonly id: AccountAction
  readonly label: string
}

const LOG_IN: AccountItem = { id: 'login', label: translate('account.logIn') }
const SIGN_UP: AccountItem = {
  id: 'signup',
  label: translate('account.signUp')
}
const SAVED: AccountItem = { id: 'saved', label: translate('account.saved') }
const LOG_OUT: AccountItem = {
  id: 'logout',
  label: translate('account.logOut')
}

/** Plans (#208): only once the upsell is allowed. */
const PLANS: AccountItem = { id: 'plans', label: translate('account.plans') }

const SIGNED_OUT: readonly AccountItem[] = [LOG_IN, SIGN_UP]
const SIGNED_IN: readonly AccountItem[] = [SAVED, LOG_OUT]

/** Signed in: before Log out, so Log out stays last. Signed out: after Sign up. */
const withPlans = (loggedIn: boolean): readonly AccountItem[] =>
  loggedIn ? [SAVED, PLANS, LOG_OUT] : [LOG_IN, SIGN_UP, PLANS]

/**
 * Signed out: Log in and Sign up. Signed in: Saved (and Log out).
 * With `plans` (the tiers flag, after the first end-to-end), Plans too.
 */
export const accountItems = (
  loggedIn: boolean,
  plans: boolean = false
): readonly AccountItem[] => {
  if (plans) return withPlans(loggedIn)
  return loggedIn ? SIGNED_IN : SIGNED_OUT
}

const ACTIONS: readonly AccountAction[] = [
  'login',
  'signup',
  'saved',
  'plans',
  'logout'
]

/** The action for a menu key, as a list: one action, or none for anything unknown. */
export const actionsFor = (key: unknown): AccountAction[] =>
  ACTIONS.filter((action) => action === key)

/** Saved is a filter on the recipe rows (#160, #179), not a page. */
export const SAVED_PATH = '/?saved=1'

/** Plans are the Upgrade page (#208). */
export const PLANS_PATH = '/upgrade'
