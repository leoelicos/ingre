import type { FC, ReactNode } from 'react'
import { Button } from 'react-aria-components'
import { Chevron, Collapse } from '../../components/Collapse'

/** The soft neumorphic outline every section header row shares (#181). */
export const HEADER_ROW =
  'flex min-h-[48px] w-full items-center justify-between gap-3 rounded-card bg-bg px-4 py-2 text-left text-text shadow-raised'

/** Title on the left with its short summary under it; the chevron sits on the right. */
const HeaderText: FC<{ id: string; title: string; summary: string }> = ({
  id,
  title,
  summary
}) => (
  <span className="flex min-w-0 flex-col">
    <span
      id={id}
      className="text-xl font-bold"
    >
      {title}
    </span>
    {summary !== '' && (
      <span className="text-sm font-normal text-text-secondary">{summary}</span>
    )}
  </span>
)

/** The title's id: the section and its heading are named by the title alone, not the summary. */
export const titleId = (headingId: string): string => `${headingId}-title`

/** How a header row toggles its content; null when it cannot collapse. */
export interface HeaderToggle {
  readonly open: boolean
  readonly onToggle: () => void
  readonly controls: string
}

/**
 * A section's header (#181): when it can collapse, the whole row is the button, with
 * aria-expanded, so a screen reader hears "Ingredients, collapsed". Otherwise it is a plain
 * heading with the same outline. The heading takes focus for Scroll to top.
 */
export const HeaderRow: FC<{
  headingId: string
  title: string
  summary: string
  toggle: HeaderToggle | null
}> = ({ headingId, title, summary, toggle }) => (
  <h2
    id={headingId}
    aria-labelledby={titleId(headingId)}
    tabIndex={-1}
    className="m-0 min-w-0 flex-1 rounded-card focus-visible:focus-ring"
  >
    {toggle === null ? (
      <span className={HEADER_ROW}>
        <HeaderText
          id={titleId(headingId)}
          title={title}
          summary={summary}
        />
      </span>
    ) : (
      <Button
        aria-expanded={toggle.open}
        aria-controls={toggle.controls}
        onPress={toggle.onToggle}
        className={`${HEADER_ROW} data-[focus-visible]:focus-ring`}
      >
        <HeaderText
          id={titleId(headingId)}
          title={title}
          summary={summary}
        />
        <Chevron open={toggle.open} />
      </Button>
    )}
  </h2>
)

/**
 * A page section (#179, #181). Collapse buttons exist only in the vertical layout; side by
 * side, both sections always show their content.
 */
export const Section: FC<{
  id: string
  title: string
  collapsible: boolean
  open: boolean
  onToggle: () => void
  /** short text in the header row, e.g. "3 recipes"; stays visible while collapsed */
  summary: string
  children: ReactNode
}> = ({ id, title, collapsible, open, onToggle, summary, children }) => (
  <section
    id={id}
    aria-labelledby={titleId(`${id}-heading`)}
    className="flex min-w-0 flex-col gap-3"
  >
    <HeaderRow
      headingId={`${id}-heading`}
      title={title}
      summary={summary}
      toggle={
        collapsible ? { open, onToggle, controls: `${id}-content` } : null
      }
    />
    <Collapse
      id={`${id}-content`}
      open={!collapsible || open}
    >
      {children}
    </Collapse>
  </section>
)
