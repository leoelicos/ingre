import type { FC } from 'react'

/** An ingredient's allergens as tags (#181), e.g. "milk"; nothing when it has none. */
export const AllergenTags: FC<{ allergens: readonly string[] }> = ({
  allergens
}) =>
  allergens.length === 0 ? null : (
    <ul
      aria-label="Allergens"
      className="m-0 flex list-none flex-wrap gap-1 p-0"
    >
      {allergens.map((allergen) => (
        <li
          key={allergen}
          className="rounded-pill border border-border bg-surface px-2 text-xs font-semibold text-text"
        >
          {allergen}
        </li>
      ))}
    </ul>
  )
