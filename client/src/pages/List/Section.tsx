import type { FC, ReactNode } from 'react'

/** What every section header row shares: its shape and text. */
const HEADER_BASE =
  'flex min-h-[48px] w-full items-center justify-between gap-3 rounded-card px-4 py-2 text-left text-text'

/** The soft neumorphic outline every section header row shares (#181). */
export const HEADER_ROW = `${HEADER_BASE} bg-bg shadow-raised`

/** A header inside a raised section lies flat on it: only one raised level at a time. */
export const headerRowClass = (flat: boolean): string =>
  flat ? HEADER_BASE : HEADER_ROW

const SECTION = 'flex min-w-0 flex-col gap-3'

/**
 * A raised section (Recipes): a large soft shadow and a border (at least 3:1 on the page), no
 * fill. Both are drawn on a pseudo-element 8px outside the section, so the section's own box,
 * and everything in it, stays exactly where it was. Otherwise the section is plain and only
 * its header row is outlined.
 */
export const RAISED_SECTION = `${SECTION} relative before:pointer-events-none before:absolute before:-inset-2 before:rounded-[calc(var(--radius-card)+8px)] before:border before:border-border before:bg-transparent before:shadow-section before:content-['']`

export const sectionClass = (raised: boolean): string =>
  raised ? RAISED_SECTION : SECTION

/**
 * A pinned heading (#192: Ingredients) stays at the top of the screen while its section
 * scrolls under it: the page's background and a z-index keep the content from showing through.
 */
export const headingClass = (sticky: boolean): string =>
  sticky
    ? 'sticky top-0 z-10 m-0 min-w-0 rounded-card bg-bg py-1 focus-visible:focus-ring'
    : 'm-0 min-w-0 rounded-card focus-visible:focus-ring'

/** The title's id: the section and its heading are named by the title alone, not the summary. */
export const titleId = (headingId: string): string => `${headingId}-title`

/**
 * A section's header (#181, #192): a plain heading with the soft outline, its title on the left
 * and a short summary under it. Nothing collapses any more. It takes focus for Scroll to top.
 */
export const HeaderRow: FC<{
  headingId: string
  title: string
  summary: string
  /** true inside a raised section */
  flat: boolean
  sticky: boolean
}> = ({ headingId, title, summary, flat, sticky }) => (
  <h2
    id={headingId}
    aria-labelledby={titleId(headingId)}
    tabIndex={-1}
    className={headingClass(sticky)}
  >
    <span className={headerRowClass(flat)}>
      <span className="flex min-w-0 flex-col">
        <span
          id={titleId(headingId)}
          className="text-xl font-bold"
        >
          {title}
        </span>
        {summary !== '' && (
          <span className="text-sm font-normal text-text-secondary">
            {summary}
          </span>
        )}
      </span>
    </span>
  </h2>
)

/** A section's heading id, so focus and Scroll to top can find it. */
export const headingId = (id: string): string => `${id}-heading`

/**
 * A page section (#179, #181, #192): one workspace, no accordions; both sections always show
 * their content.
 */
export const Section: FC<{
  id: string
  title: string
  /** short text in the header row, e.g. "3 recipes" */
  summary: string
  /** the whole section is a raised outline (Recipes); its header then lies flat */
  raised?: boolean
  /** the header stays pinned at the top while the section scrolls (Ingredients) */
  sticky?: boolean
  className?: string
  children: ReactNode
}> = ({
  id,
  title,
  summary,
  raised = false,
  sticky = false,
  className = '',
  children
}) => (
  <section
    id={id}
    aria-labelledby={titleId(headingId(id))}
    className={`${sectionClass(raised)} ${className}`}
  >
    <HeaderRow
      headingId={headingId(id)}
      title={title}
      summary={summary}
      flat={raised}
      sticky={sticky}
    />
    <div className="p-1.5">{children}</div>
  </section>
)
