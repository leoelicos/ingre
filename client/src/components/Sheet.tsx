import { useT } from '../i18n'
import type { FC, ReactNode } from 'react'
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay
} from 'react-aria-components'
import { SHEET_SWIPE, useSwipe } from '../utils/gestures/swipe'
import { DESKTOP_MIN_WIDTH, useMinWidth } from '../utils/media/useMinWidth'

/** The overlay: dims the page; the sheet sits at the bottom, the modal in the centre (#192). */
const OVERLAY =
  'fixed inset-0 z-30 flex items-end justify-center bg-scrim desk:items-center desk:p-6 motion-safe:data-[entering]:animate-fade-in motion-safe:data-[exiting]:animate-fade-out'

/**
 * Mobile: a sheet up from the bottom, clear of the home indicator. Desktop: a centred modal.
 * It slides (or fades) in over 0.2 s, and not at all with reduced motion.
 */
const PANEL =
  'flex max-h-[90dvh] w-full flex-col rounded-t-card bg-bg pb-[env(safe-area-inset-bottom)] text-text shadow-raised motion-safe:data-[entering]:animate-sheet-in motion-safe:data-[exiting]:animate-sheet-out desk:max-h-[85dvh] desk:max-w-5xl desk:rounded-card desk:pb-0 desk:motion-safe:data-[entering]:animate-fade-in desk:motion-safe:data-[exiting]:animate-fade-out'

const CLOSE_BUTTON =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-bg text-lg font-bold text-text shadow-raised data-[pressed]:shadow-pressed data-[focus-visible]:focus-ring'

/** The close button's id: focus can land there when nothing else in the sheet is left. */
export const sheetCloseId = (id: string): string => `${id}-close`

/**
 * Discovery (#192): a bottom sheet below 576px, a centred modal from there. React Aria traps
 * focus inside, closes it on Escape or a press on the dimmed page, and puts focus back on the
 * button that opened it. On mobile the top bar (with its grip) can be swiped down to close;
 * the ✕ does the same for keyboard and screen reader users. What sits in `top` (the search
 * bar) stays at the top while the rest scrolls.
 */
export const Sheet: FC<{
  id: string
  title: string
  isOpen: boolean
  onClose: () => void
  /** read out inside the sheet, e.g. "Butter added to Extra" */
  status: string
  top: ReactNode
  children: ReactNode
}> = ({ id, title, isOpen, onClose, status, top, children }) => {
  const t = useT()
  const mobile = !useMinWidth(DESKTOP_MIN_WIDTH)
  const swipe = useSwipe(SHEET_SWIPE, mobile, onClose)
  return (
    <ModalOverlay
      isOpen={isOpen}
      isDismissable
      /* a controlled modal only ever asks to close: Escape or a press on the dimmed page */
      onOpenChange={onClose}
      className={OVERLAY}
    >
      <Modal
        className={PANEL}
        style={{ transform: swipe.transform }}
      >
        <Dialog
          id={id}
          className="flex min-h-0 flex-1 flex-col outline-none"
        >
          <div
            {...swipe.handlers}
            data-sheet-grip=""
            className="flex shrink-0 touch-none select-none flex-col gap-1 px-4 pb-2 pt-2 desk:touch-auto desk:pt-4"
          >
            <span
              aria-hidden="true"
              className="mx-auto block h-1.5 w-12 rounded-pill bg-text-secondary desk:hidden"
            />
            <div className="flex items-center gap-2">
              <Heading
                slot="title"
                className="m-0 flex-1 text-xl font-bold"
              >
                {title}
              </Heading>
              <Button
                id={sheetCloseId(id)}
                aria-label={t('sheet.close', { title })}
                onPress={onClose}
                className={CLOSE_BUTTON}
              >
                <span aria-hidden="true">✕</span>
              </Button>
            </div>
          </div>
          <div className="shrink-0 px-4 pb-3">{top}</div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            {children}
          </div>
          <p
            role="status"
            className="sr-only"
          >
            {status}
          </p>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
