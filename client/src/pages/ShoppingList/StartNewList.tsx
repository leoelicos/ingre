import type { FC } from 'react'
import { IngreIconStartOver } from '../../lib/icon/Icon'
import './startNewList.css'

/** Quiet text button at the foot of the list. Self-contained so it can move. */
export const StartNewList: FC<{ onStart: () => void }> = ({ onStart }) => (
  <button
    type="button"
    className="start-new"
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
    <button
      type="button"
      className="btn btn-primary all-done__button"
      onClick={onStart}
    >
      Start a new list
    </button>
  </section>
)

/** Sits just above the bottom bar for UNDO_MS; static (no slide). */
export const ClearedNote: FC<{ onUndo: () => void }> = ({ onUndo }) => (
  <p
    className="cleared-note"
    role="status"
  >
    List cleared ·{' '}
    <button
      type="button"
      className="link-button"
      onClick={onUndo}
    >
      Undo
    </button>
  </p>
)
