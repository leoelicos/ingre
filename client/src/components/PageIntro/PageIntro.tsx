import type { FC, ReactNode } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface Descriptor {
  icon: ReactNode
  text: string
}

export interface PageIntroProps {
  breadcrumbs?: BreadcrumbItem[]
  title: string
  description?: string
  descriptors?: Descriptor[]
}

/** Clean page header: breadcrumb, h1, paragraph, iconned descriptors. */
export const PageIntro: FC<PageIntroProps> = ({
  breadcrumbs = [],
  title,
  description,
  descriptors = []
}) => (
  <header className="flex flex-col gap-3">
    {breadcrumbs.length > 0 && (
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-sm text-text-secondary"
      >
        {breadcrumbs.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-1"
          >
            {i > 0 && <span aria-hidden="true">›</span>}
            {item.href ? (
              <a
                href={item.href}
                className="hover:underline"
              >
                {item.label}
              </a>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    )}
    <h1 className="m-0 text-2xl font-semibold text-text">{title}</h1>
    {description && <p className="m-0 text-text-secondary">{description}</p>}
    {descriptors.length > 0 && (
      <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
        {descriptors.map((d, i) => (
          <li
            key={i}
            className="flex items-center gap-2"
          >
            <span
              className="shrink-0"
              aria-hidden="true"
            >
              {d.icon}
            </span>
            <span>{d.text}</span>
          </li>
        ))}
      </ul>
    )}
  </header>
)
