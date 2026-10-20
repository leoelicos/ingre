import type { FC } from 'react'
import { IngreIconStartOver } from '../../lib/icon/Icon'
import { PrimaryButton } from '../../components/PrimaryButton'
import type { UndoResult } from '../../utils/shopping/useStartNewList'
import './startNewList.css'

/** Quiet text button at the foot of the list. Self-contained so it can move. */
export const StartNewList: FC<{ onStart: () => void }> = ({ onStart }) => (
  <button
    type="button"
    className="start-new focus-visible:focus-ring"
    onClick={onStart}
  >
    <IngreIconStartOver /> Start a new list
  </button>
)

/** Calm card once everything is in the basket. */
export const AllDone: FC<{ onStart: () => void }> = ({ onStart }) => (
  <section
    className="all-done"
    aria-label="All done"
  >
    <h2 className="all-done__title">All done</h2>
    <p className="list-note">Everything is in the basket.</p>
    <PrimaryButton
      onPress={onStart}
      className="all-done__button"
    >
      Start a new list
    </PrimaryButton>
  </section>
)

/** Said by the always-present polite live region in ShoppingFlow when a list is cleared. */
export const LIST_CLEARED = 'List cleared'

/** Ref callback: focuses the element when it mounts (React calls it with null on unmount). */
export const focusOnMount = (element: HTMLElement | null): void =>
  element?.focus()

/**
 * Sits just above the bottom bar for UNDO_MS; static (no slide). Gone once Undo is used or the
 * list changes. Not itself a live region: ShoppingFlow announces LIST_CLEARED.
 * Undo takes focus as soon as it appears, so it is the very next control for keyboard users;
 * the countdown is paused while focus is inside the note.
 */
export const ClearedNote: FC<{
  onUndo: () => UndoResult
  onFocusIn: () => void
  onFocusOut: () => void
}> = ({ onUndo, onFocusIn, onFocusOut }) => (
  <p
    className="cleared-note"
    onFocus={onFocusIn}
    onBlur={onFocusOut}
  >
    {LIST_CLEARED} ·{' '}
    <button
      ref={focusOnMount}
      type="button"
      className="link-button focus-visible:focus-ring"
      onClick={onUndo}
    >
      Undo
    </button>
  </p>
)
