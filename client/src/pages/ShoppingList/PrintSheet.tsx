import type { FC } from 'react'
import { createPortal } from 'react-dom'
import { splitTitle } from '../../components/Widgets/RecipeCard/recipeCardHelpers'
import type { LibraryRecipe } from '../../types/library'
import { SHOP_SECTIONS } from '../../utils/shopping/sections'
import type { ShopLine } from '../../utils/shopping/shoppingList'
import {
  buyAmount,
  displayName,
  groupBy,
  needLabel
} from '../../utils/shopping/shoppingList'
import './print.css'

/** Paper list: recipes and serves, then to-buy items by shop section. Only shown in print. */
export const PrintSheet: FC<{
  recipes: readonly LibraryRecipe[]
  people: number
  toBuy: readonly ShopLine[]
}> = ({ recipes, people, toBuy }) =>
  createPortal(
    <div
      className="print-sheet"
      data-testid="print-sheet"
    >
      <p className="print-sheet__brand">ingré</p>
      <h1>Shopping list</h1>
      <p className="print-sheet__meta">
        {recipes.length > 0 &&
          `${recipes.map((r) => splitTitle(r.name).title).join(', ')} · `}
        Serves {people}
      </p>
      {groupBy(toBuy, (l) => l.section, SHOP_SECTIONS).map(({ key, items }) => (
        <section
          key={key}
          className="print-sheet__section"
        >
          <h2>{key}</h2>
          {groupBy(items, (l) => l.subsection ?? '').map((sub) => (
            <div key={sub.key}>
              {sub.key !== '' && <h3>{sub.key}</h3>}
              <ul>
                {sub.items.map((line) => (
                  <li key={line.ingredientId}>
                    <span
                      className="print-sheet__box"
                      aria-hidden="true"
                    />
                    <strong>{buyAmount(line)}</strong> {displayName(line)}{' '}
                    <small>{needLabel(line)}</small>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>,
    document.body
  )
