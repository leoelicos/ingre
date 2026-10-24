import type { FC, ReactNode } from 'react'
import { Button } from 'react-aria-components'
import { Chevron, Collapse } from '../../components/Collapse'

/** The visible title doubles as the toggle; the heading itself can take focus (scroll to top). */
const TOGGLE =
  'flex min-h-[44px] items-center gap-2 rounded-control px-1 text-left text-xl font-bold text-text data-[focus-visible]:focus-ring'

/**
 * A collapsible page section (#179). The heading holds a real button with aria-expanded, so
 * a screen reader hears "Ingredients, collapsed" or "expanded"; the content pushes down below.
 */
export const Section: FC<{
  id: string
  title: string
  open: boolean
  onToggle: () => void
  /** short text beside the title, e.g. "3 recipes"; stays visible while collapsed */
  summary: string
  children: ReactNode
}> = ({ id, title, open, onToggle, summary, children }) => (
  <section
    id={id}
    aria-labelledby={`${id}-heading`}
    className="flex flex-col gap-3"
  >
    <div className="flex flex-wrap items-center gap-x-3">
      <h2
        id={`${id}-heading`}
        tabIndex={-1}
        className="m-0 rounded-control focus-visible:focus-ring"
      >
        <Button
          aria-expanded={open}
          aria-controls={`${id}-content`}
          onPress={onToggle}
          className={TOGGLE}
        >
          <Chevron open={open} />
          {title}
        </Button>
      </h2>
      <span className="text-sm text-text-secondary">{summary}</span>
    </div>
    <Collapse
      id={`${id}-content`}
      open={open}
    >
      {children}
    </Collapse>
  </section>
)
