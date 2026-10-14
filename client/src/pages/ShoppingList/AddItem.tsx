import type { FC } from 'react'
import { useId, useState } from 'react'
import type { LibraryIngredient } from '../../types/library'
import { catalogue } from '../../utils/library/recipeLibrary'
import { displayName } from '../../utils/shopping/shoppingList'
import type { NewExtra } from '../../utils/shopping/useShoppingList'

const MAX_SUGGESTIONS = 6

/** Catalogue items whose name contains every typed word. */
export const suggest = (
  query: string,
  items: readonly LibraryIngredient[] = catalogue
): LibraryIngredient[] => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return items
    .filter((i) => words.every((w) => i.name.toLowerCase().includes(w)))
    .slice(0, MAX_SUGGESTIONS)
}

/** "Add an item": pick a catalogue match or add free text. */
export const AddItem: FC<{ onAdd: (extra: NewExtra) => void }> = ({
  onAdd
}) => {
  const id = useId()
  const [query, setQuery] = useState('')
  const matches = suggest(query)
  const add = (extra: NewExtra) => {
    onAdd(extra)
    setQuery('')
  }
  return (
    <form
      className="add-item"
      onSubmit={(e) => {
        e.preventDefault()
        const text = query.trim()
        if (text === '') return
        const exact = matches.find(
          (m) => m.name.toLowerCase() === text.toLowerCase()
        )
        add({ name: exact?.name ?? text, ingredientId: exact?.id ?? null })
      }}
    >
      <label
        htmlFor={id}
        className="sr-only"
      >
        Add an item
      </label>
      <div className="add-item__row">
        <input
          id={id}
          type="text"
          autoComplete="off"
          placeholder="Add an item, e.g. milk"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary add-item__button"
        >
          Add
        </button>
      </div>
      {matches.length > 0 && (
        <ul
          className="add-item__suggestions"
          aria-label="Suggestions"
        >
          {matches.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => add({ name: item.name, ingredientId: item.id })}
              >
                {displayName(item)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
