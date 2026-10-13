import type { ClientRecipe } from '../../types/client'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { catalogue, library } from '../library/recipeLibrary'
import { usePeople } from '../storage/people'
import {
  useBasketIds,
  useHaveIds,
  useListView,
  useLocationOverrides
} from '../storage/shoppingState'
import { buildShoppingList, splitByHave, withLocations } from './shoppingList'

/** Library recipes behind the user's saved recipes, in saved order. */
export const savedToLibrary = (
  saved: readonly ClientRecipe[],
  recipes: readonly LibraryRecipe[] = library
): LibraryRecipe[] =>
  saved.flatMap((s) => recipes.filter((r) => r.id === s.libraryId))

export const stapleIds = (
  items: readonly LibraryIngredient[]
): ReadonlySet<string> =>
  new Set(items.filter((i) => i.staple === true).map((i) => i.id))

const STAPLES = stapleIds(catalogue)

/** Everything the list screens need: derived lines plus persisted ticks. */
export const useShoppingList = (recipes: readonly LibraryRecipe[]) => {
  const [people, setPeople] = usePeople()
  const [haveIds, toggleHave] = useHaveIds(STAPLES)
  const [basketIds, toggleBasket] = useBasketIds()
  const [overrides, setLocation] = useLocationOverrides()
  const [view, setView] = useListView()
  const lines = withLocations(
    buildShoppingList(recipes, people, catalogue),
    overrides
  )
  return {
    people,
    setPeople,
    view,
    setView,
    haveIds,
    toggleHave,
    basketIds,
    toggleBasket,
    setLocation,
    ...splitByHave(lines, haveIds)
  }
}
