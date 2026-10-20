import type { FC } from 'react'
import { useId } from 'react'
import type { IngredientBadgeProps } from '../../components/IngredientBadge/IngredientBadge'
import { IngredientBadge } from '../../components/IngredientBadge/IngredientBadge'
import type { LibraryIngredient } from '../../types/library'
import { catalogue } from '../../utils/library/recipeLibrary'
import { SHOP_SECTIONS } from '../../utils/shopping/sections'
import type { ShopLine } from '../../utils/shopping/shoppingList'
import {
  catalogueIdOf,
  displayName,
  groupBy
} from '../../utils/shopping/shoppingList'

/** "1 item", "3 items". */
export const itemCount = (n: number): string =>
  `${n} ${n === 1 ? 'item' : 'items'}`

/** The catalogue entry behind a list line; null for free text. */
export const catalogueItemFor = (
  lineId: string,
  items: readonly LibraryIngredient[]
): LibraryIngredient | null =>
  items.find((item) => item.id === catalogueIdOf(lineId)) ?? null

/** The same badge a recipe shows for the item (#162); free text gets the neutral tone. */
export const lineBadge = (
  line: Pick<ShopLine, 'ingredientId' | 'name'>,
  items: readonly LibraryIngredient[] = catalogue
): IngredientBadgeProps => {
  const item = catalogueItemFor(line.ingredientId, items)
  return item === null
    ? { name: line.name, category: '' }
    : {
        name: item.name,
        category: item.category,
        ...(item.badgeCode === undefined ? {} : { badgeCode: item.badgeCode })
      }
}

/** Lines in shop-section order, so the chips read like a walk round the shop. */
export const chipOrder = (lines: readonly ShopLine[]): ShopLine[] =>
  groupBy(lines, (line) => line.section, SHOP_SECTIONS).flatMap(
    (group) => group.items
  )

/**
 * The shopping list as chips (#159): picked recipes' ingredients, minus what is at home, plus
 * extras. A real list, so VoiceOver reads the count, and each chip says the full name.
 */
export const ShoppingChips: FC<{ lines: readonly ShopLine[] }> = ({
  lines
}) => {
  const id = useId()
  const count = itemCount(lines.length)
  return (
    <section
      aria-labelledby={id}
      className="mb-2"
    >
      <h2
        id={id}
        className="list-heading"
      >
        Shopping list{' '}
        <span className="text-base font-normal text-text-secondary">
          {count}
        </span>
      </h2>
      {lines.length > 0 && (
        <ul
          aria-label={`Shopping list, ${count}`}
          className="m-0 flex list-none flex-wrap gap-2 p-0"
        >
          {chipOrder(lines).map((line) => (
            <li
              key={line.ingredientId}
              className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface py-1 pl-1 pr-3 text-sm font-semibold text-text"
            >
              <IngredientBadge {...lineBadge(line)} />
              {displayName(line)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
