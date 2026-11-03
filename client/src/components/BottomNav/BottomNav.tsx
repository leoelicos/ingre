import { useT } from '../../i18n'
import type { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useKeyboardOpen } from '../../utils/media/useKeyboardOpen'
import type { Tab } from '../../utils/nav/tabs'
import { TABS, activeTabs } from '../../utils/nav/tabs'

const TAB =
  'flex min-h-[56px] flex-1 items-center justify-center rounded-control px-2 text-sm font-semibold text-text no-underline focus-visible:focus-ring'
const TAB_ON = 'bg-chip-active text-primary'

const TabLink: FC<{ tab: Tab; current: boolean }> = ({ tab, current }) => (
  <li className="flex flex-1">
    <Link
      to={tab.to}
      aria-current={current ? 'page' : undefined}
      className={`${TAB} ${current ? TAB_ON : ''}`.trim()}
    >
      {tab.label}
    </Link>
  </li>
)

/** Height the page leaves free under its content, so the bar never covers the last row. */
export const NAV_SPACE = 'h-[calc(4.5rem+env(safe-area-inset-bottom))]'

/**
 * The four tabs (#227): Explore, Inventory, Cook, Profile. One stable bar at the bottom of every
 * page, same order and place everywhere. Explore, Inventory and Cook take you to that part of the
 * one page; Profile is its own page, with Saved recipes under it. While the on-screen keyboard
 * is up the bar steps aside (#228), so typing keeps the whole visible screen.
 */
export const BottomNav: FC = () => {
  const t = useT()
  const { pathname, hash } = useLocation()
  const current = activeTabs(pathname, hash)
  const keyboard = useKeyboardOpen()
  return (
    <>
      <div
        aria-hidden="true"
        hidden={keyboard}
        className={NAV_SPACE}
      />
      <nav
        aria-label={t('nav.label')}
        hidden={keyboard}
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto m-0 flex max-w-layout list-none gap-1 p-1">
          {TABS.map((tab) => (
            <TabLink
              key={tab.id}
              tab={tab}
              current={current.includes(tab.id)}
            />
          ))}
        </ul>
      </nav>
    </>
  )
}
