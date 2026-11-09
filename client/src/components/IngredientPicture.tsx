import type { FC } from 'react'

/**
 * An ingredient's pictogram (public/ingredients/<id>.svg, #290), drawn inline at the text's
 * own size so no layout moves. Decorative: the name is always written beside it, so it is
 * hidden from assistive tech. Lazy, so a long list only fetches the pictures in view.
 */
export const IngredientPicture: FC<{ id: string }> = ({ id }) => (
  <img
    src={`/ingredients/${id}.svg`}
    alt=""
    aria-hidden="true"
    loading="lazy"
    decoding="async"
    width={20}
    height={20}
    data-testid="ingredient-picture"
    className="inline-block h-[1.25em] w-[1.25em] shrink-0 align-middle"
  />
)
