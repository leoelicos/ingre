/* The four tabs (#227): Explore, Inventory, Cook, Profile. A stable bottom navigation on every page. */
import { translate } from '../../i18n'

export type TabId = 'explore' | 'inventory' | 'cook' | 'profile'

export interface Tab {
  readonly id: TabId
  readonly label: string
  /** Where the tab goes: a place on the one page, or the Profile page. */
  readonly to: string
}

/** The tabs, labelled in the current language. */
export const tabs = (): readonly Tab[] => [
  { id: 'explore', label: translate('nav.explore'), to: '/#explore' },
  { id: 'inventory', label: translate('nav.inventory'), to: '/#inventory' },
  { id: 'cook', label: translate('nav.cook'), to: '/#cook' },
  { id: 'profile', label: translate('nav.profile'), to: '/profile' }
]

export const PROFILE_PATH = '/profile'

const HASH_TAB: Readonly<Record<string, TabId>> = {
  '#inventory': 'inventory',
  '#cook': 'cook'
}

/** The tab the page is on, as a list: none on Log in, Sign up and the like. */
export const activeTabs = (pathname: string, hash: string): TabId[] => {
  if (pathname === PROFILE_PATH) return ['profile']
  if (pathname !== '/') return []
  return [HASH_TAB[hash] ?? 'explore']
}
