import type { FC } from 'react'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import type { LibraryIngredient } from '../../types/library'
import { catalogue } from '../../utils/library/recipeLibrary'
import { matchCatalogue } from '../../utils/library/catalogueMatch'
import type { NewExtra } from '../../utils/shopping/useShoppingList'
import type { Extra } from '../../utils/storage/shoppingState'

/** What the empty search needs from the list: its extras, how to add one, how to open it. */
export interface EmptySearchList {
  extras: readonly Extra[]
  onAdd: (extra: NewExtra) => void
  onViewList: () => void
}

const AddMatched: FC<{ item: LibraryIngredient; list: EmptySearchList }> = ({
  item,
  list
}) => {
  const onList = list.extras.some((e) => e.ingredientId === item.id)
  return (
    <>
      <p className="empty-search__text">
        No recipes with {item.name} yet. You can add {item.name} to your list
      </p>
      {onList ? (
        <button
          type="button"
          className="btn btn-primary empty-search__button"
          onClick={list.onViewList}
        >
          ✓ {capitaliseFirst(item.name)} is on your list. View list
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary empty-search__button"
          onClick={() => list.onAdd({ name: item.name, ingredientId: item.id })}
        >
          + Add {item.name}
        </button>
      )}
    </>
  )
}

/** No recipes for the search: offer the catalogue item as a list extra when it exists. */
export const EmptySearch: FC<{ query: string; list: EmptySearchList }> = ({
  query,
  list
}) => {
  const match = matchCatalogue(query, catalogue)
  return (
    <div
      className="empty-search"
      role="status"
    >
      {match.kind === 'matched' ? (
        <AddMatched
          item={match.item}
          list={list}
        />
      ) : (
        <p className="empty-search__text">No recipes with {match.text} yet.</p>
      )}
    </div>
  )
}
