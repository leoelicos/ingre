import type { FC } from 'react'
import { useGuestList } from '../../utils/guests/GuestsContext'
import { conflictText, conflictsOf } from '../../utils/guests/guests'

/** A bar in the accent colour (3:1 on the page) down the left; the words carry the meaning. */
export const FLAG_BAR = 'border-l-4 border-accent pl-2'

/**
 * Who in the guest profiles cannot have something with these allergen tags (#209): in words,
 * with the accent bar beside it. Nothing when there are no guests or no clash.
 */
export const GuestFlag: FC<{
  tags: readonly string[]
  className?: string
}> = ({ tags, className = '' }) => {
  const text = conflictText(conflictsOf(tags, useGuestList()))
  return text === '' ? null : (
    <p
      data-testid="guest-flag"
      className={`m-0 ${FLAG_BAR} text-sm font-semibold text-text ${className}`}
    >
      {text}
    </p>
  )
}
