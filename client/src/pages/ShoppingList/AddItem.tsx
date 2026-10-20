import type { FC } from 'react'
import { useId, useState } from 'react'
import type { LibraryIngredient } from '../../types/library'
import { catalogue } from '../../utils/library/recipeLibrary'
import { matchCatalogue } from '../../utils/library/catalogueMatch'
import { placeInShop } from '../../utils/shopping/sections'
import { displayName } from '../../utils/shopping/shoppingList'
import type { NewExtra } from '../../utils/shopping/useShoppingList'
import { IngredientBadge } from '../../components/IngredientBadge/IngredientBadge'
import { PrimaryButton } from '../../components/PrimaryButton'

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

/** The catalogue item for typed text ("eggs" finds egg), else the text as free text (#162). */
export const toExtra = (
  text: string,
  items: readonly LibraryIngredient[] = catalogue
): NewExtra => {
  const match = matchCatalogue(text, items)
  return match.kind === 'matched'
    ? { name: match.item.name, ingredientId: match.item.id }
    : { name: match.text, ingredientId: null }
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
        if (query.trim() === '') return
        add(toExtra(query))
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
          className="focus-visible:focus-ring"
        />
        <PrimaryButton
          type="submit"
          size="compact"
        >
          Add
        </PrimaryButton>
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
                className="flex items-center gap-3 focus-visible:focus-ring"
                onClick={() => add({ name: item.name, ingredientId: item.id })}
              >
                <IngredientBadge
                  name={item.name}
                  category={item.category}
                  {...(item.badgeCode === undefined
                    ? {}
                    : { badgeCode: item.badgeCode })}
                />
                <span className="flex flex-col leading-tight">
                  <span>{displayName(item)}</span>
                  <span className="text-xs text-text-secondary">
                    {placeInShop(item.category).section}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
