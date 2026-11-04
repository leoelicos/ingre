import type { FC } from 'react'
import { Button } from '../../lib/aria'
import { Chevron, Collapse } from '../Collapse'
import { useFaqAccordion } from '../../hooks/useFaqAccordion'
import type { FaqItem } from './types'

export interface FaqAccordionProps {
  title?: string
  subtitle?: string
  items: FaqItem[]
}

/** Collapsed FAQ accordions, one open at a time. Presentation only. */
export const FaqAccordion: FC<FaqAccordionProps> = ({
  title = 'Questions about this recipe',
  subtitle,
  items
}) => {
  const { toggle, isOpen } = useFaqAccordion()
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 text-xl font-semibold text-text">{title}</h2>
        {subtitle && <p className="m-0 mt-1 text-text-secondary">{subtitle}</p>}
      </div>
      <ul className="m-0 list-none divide-y divide-border p-0">
        {items.map((item) => {
          const open = isOpen(item.id)
          return (
            <li key={item.id}>
              <Button
                onPress={() => toggle(item.id)}
                aria-expanded={open}
                aria-controls={`faq-${item.id}`}
                className="flex w-full items-center justify-between py-3 text-left font-medium text-text data-[focus-visible]:focus-ring"
              >
                {item.question}
                <Chevron open={open} />
              </Button>
              <Collapse id={`faq-${item.id}`} open={open}>
                <p className="m-0 pb-3 text-text-secondary">{item.answer}</p>
              </Collapse>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
