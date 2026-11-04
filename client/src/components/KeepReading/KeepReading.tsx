import type { FC } from 'react'

export interface RelatedItem {
  id: string
  title: string
  description: string
  href?: string
}

export interface KeepReadingProps {
  title?: string
  items: RelatedItem[]
}

/** Related recipes / articles as simple stacked cards. */
export const KeepReading: FC<KeepReadingProps> = ({
  title = 'Keep reading',
  items
}) => (
  <section aria-label={title} className="flex flex-col gap-3">
    <h2 className="m-0 text-xl font-semibold text-text">{title}</h2>
    <ul className="m-0 list-none flex flex-col gap-2 p-0">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.href ?? `#${item.id}`}
            className="block rounded-control border border-border bg-bg p-4 text-text shadow-raised data-[focus-visible]:focus-ring hover:bg-bg-hover"
          >
            <span className="block font-semibold">{item.title}</span>
            <span className="mt-1 block text-sm text-text-secondary">{item.description}</span>
          </a>
        </li>
      ))}
    </ul>
  </section>
)
