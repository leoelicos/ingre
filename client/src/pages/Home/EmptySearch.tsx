import type { FC } from 'react'
import { Link } from 'react-router-dom'
import type { LibraryIngredient } from '../../types/library'
import { catalogue } from '../../utils/library/recipeLibrary'
import { matchCatalogue } from '../../utils/library/catalogueMatch'
import { addExtra } from '../../utils/shopping/useShoppingList'
import { useExtras } from '../../utils/storage/shoppingState'

const AddMatched: FC<{ item: LibraryIngredient }> = ({ item }) => {
  const [extras, updateExtras] = useExtras()
  const onList = extras.some((e) => e.ingredientId === item.id)
  return (
    <>
      <p className="empty-search__text">
        No recipes with {item.name} yet. You can add {item.name} to your list
      </p>
      {onList ? (
        <Link
          to="/ingredients"
          className="btn btn-primary empty-search__button"
        >
          ✓ {item.name} is on your list. View list
        </Link>
      ) : (
        <button
          type="button"
          className="btn btn-primary empty-search__button"
          onClick={() =>
            updateExtras((previous) =>
              addExtra(previous, { name: item.name, ingredientId: item.id })
            )
          }
        >
          + Add {item.name}
        </button>
      )}
    </>
  )
}

/** No recipes for the search: offer the catalogue item as a list extra when it exists. */
export const EmptySearch: FC<{ query: string }> = ({ query }) => {
  const match = matchCatalogue(query, catalogue)
  return (
    <div
      className="empty-search"
      role="status"
    >
      {match.kind === 'matched' ? (
        <AddMatched item={match.item} />
      ) : (
        <p className="empty-search__text">No recipes with {match.text} yet.</p>
      )}
    </div>
  )
}
