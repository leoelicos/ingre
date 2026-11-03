import type { FC, ReactElement } from 'react'
import { Tooltip, TooltipTrigger } from 'react-aria-components'
import { useExplore } from '../../utils/explore/ExploreContext'
import { showsTips } from '../../utils/guidance/guidance'

/** How long a pointer rests before a tip shows (keyboard focus shows it at once). */
export const TIP_DELAY = 400

/** A tooltip on its one focusable child from Guided up (#206); in Self-directed, just the child. */
export const Tip: FC<{ text: string; children: ReactElement }> = ({
  text,
  children
}) => {
  const { guidance } = useExplore()
  return showsTips(guidance) ? (
    <TooltipTrigger delay={TIP_DELAY}>
      {children}
      <Tooltip className="max-w-xs rounded-control bg-text px-3 py-2 text-sm text-inverse-text shadow-raised">
        {text}
      </Tooltip>
    </TooltipTrigger>
  ) : (
    children
  )
}
