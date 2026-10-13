import { useSaved } from '../../pages/Saved/useSaved'
import { savedToLibrary } from './useShoppingList'

/** Saved recipes (from the server) resolved to local library recipes. */
export const useSavedLibraryRecipes = () => {
  const { loading, error, savedRecipes } = useSaved()
  return { loading, error, recipes: savedToLibrary(savedRecipes) }
}
