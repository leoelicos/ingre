import { useT } from '../i18n'
import type { FC, ReactNode } from 'react'
import { useKeyboardOpen } from '../utils/layout/keyboard'
import { ABOVE_NAV } from './BottomNav/BottomNav'

/**
 * The bottom-right area (#210): a column of round buttons fixed to the corner nearest a thumb,
 * with the page scrolling underneath. A drag that starts on it still scrolls the page
 * (`touch-pan-y`), and it steps aside while the on-screen keyboard is up.
 */
export const Bra: FC<{ children: ReactNode }> = ({ children }) => {
  const t = useT()
  const keyboard = useKeyboardOpen()
  return keyboard ? null : (
    <div
      role="group"
      aria-label={t('bra.label')}
      data-bra=""
      className={`fixed ${ABOVE_NAV} right-4 z-10 flex touch-pan-y flex-col items-end gap-3`}
    >
      {children}
    </div>
  )
}
