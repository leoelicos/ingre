/** What each account menu item does. */
export type AccountAction = 'login' | 'signup' | 'saved' | 'logout'

export interface AccountItem {
  readonly id: AccountAction
  readonly label: string
}

const SIGNED_OUT: readonly AccountItem[] = [
  { id: 'login', label: 'Log in' },
  { id: 'signup', label: 'Sign up' }
]

const SIGNED_IN: readonly AccountItem[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'logout', label: 'Log out' }
]

/** Signed out: Log in and Sign up. Signed in: Saved (and Log out). */
export const accountItems = (loggedIn: boolean): readonly AccountItem[] =>
  loggedIn ? SIGNED_IN : SIGNED_OUT

const ACTIONS: readonly AccountAction[] = ['login', 'signup', 'saved', 'logout']

/** The action for a menu key, as a list: one action, or none for anything unknown. */
export const actionsFor = (key: unknown): AccountAction[] =>
  ACTIONS.filter((action) => action === key)

/** Saved is a filter on the recipe rows (#160, #179), not a page. */
export const SAVED_PATH = '/?saved=1'
