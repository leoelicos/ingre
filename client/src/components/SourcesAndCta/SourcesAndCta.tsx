import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '../../lib/aria'
import { Chevron, Collapse } from '../Collapse'

export interface SourcesAndCtaProps {
  sourcesTitle?: string
  sourcesSubtitle?: string
  sourcesContent: ReactNode
  ctaTitle?: string
  ctaDescription?: string
  ctaLabel?: string
  onCta?: () => void
}

/** Sources disclosure + dark CTA banner. */
export const SourcesAndCta: FC<SourcesAndCtaProps> = ({
  sourcesTitle = 'Sources and review details',
  sourcesSubtitle = 'How we curated this recipe',
  sourcesContent,
  ctaTitle = 'Ready when you are',
  ctaDescription = 'Add this recipe to your list and start cooking.',
  ctaLabel = 'Get started',
  onCta
}) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-control border border-border bg-bg p-3">
        <Button
          onPress={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="sources-content"
          className="flex w-full items-center gap-3 text-left data-[focus-visible]:focus-ring"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded bg-bg-secondary"
            aria-hidden="true"
          >
            📖
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-text">
              {sourcesTitle}
            </span>
            <span className="block text-sm text-text-secondary">
              {sourcesSubtitle}
            </span>
          </span>
          <Chevron open={open} />
        </Button>
        <Collapse
          id="sources-content"
          open={open}
        >
          <div className="pt-3 text-sm text-text-secondary">
            {sourcesContent}
          </div>
        </Collapse>
      </div>
      <div className="rounded-control bg-text p-6 text-bg">
        <h2 className="m-0 text-xl font-semibold">{ctaTitle}</h2>
        <p className="mt-2 mb-4 text-sm opacity-90">{ctaDescription}</p>
        <Button
          onPress={onCta ?? (() => {})}
          className="w-full rounded-control bg-bg py-3 font-semibold text-text data-[focus-visible]:focus-ring"
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}
