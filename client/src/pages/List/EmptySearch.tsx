import type { FC } from 'react'
import { Button } from 'react-aria-components'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import type { LibraryIngredient } from '../../types/library'
import { catalogue } from '../../utils/library/recipeLibrary'
import { matchCatalogue } from '../../utils/library/catalogueMatch'

/** What the empty search needs from the list: whether an item is a chip, and how to add one. */
export interface EmptySearchList {
  readonly hasChip: (id: string) => boolean
  readonly onAdd: (item: LibraryIngredient) => void
  readonly onViewList: () => void
}

const BUTTON =
  'inline-flex min-h-[44px] items-center self-start rounded-pill bg-primary px-5 font-semibold text-on-primary data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

const AddMatched: FC<{ item: LibraryIngredient; list: EmptySearchList }> = ({
  item,
  list
}) => (
  <>
    <p className="m-0">
      No recipes with {item.name} yet. You can add {item.name} to your list
    </p>
    {list.hasChip(item.id) ? (
      <Button
        onPress={list.onViewList}
        className={BUTTON}
      >
        ✓ {capitaliseFirst(item.name)} is on your list. View list
      </Button>
    ) : (
      <Button
        onPress={() => list.onAdd(item)}
        className={BUTTON}
      >
        + Add {item.name}
      </Button>
    )}
  </>
)

/** No recipes for the search: offer the catalogue item as a chip when it exists. */
export const EmptySearch: FC<{ query: string; list: EmptySearchList }> = ({
  query,
  list
}) => {
  const match = matchCatalogue(query, catalogue)
  return (
    <div
      className="flex flex-col gap-3 text-text"
      role="status"
    >
      {match.kind === 'matched' ? (
        <AddMatched
          item={match.item}
          list={list}
        />
      ) : (
        <p className="m-0">No recipes with {match.text} yet.</p>
      )}
    </div>
  )
}
