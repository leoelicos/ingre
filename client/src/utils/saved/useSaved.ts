/* Hearts on the server (#182, F4): saveRecipe and removeRecipe, read back with getSavedRecipes. */
import type { ApolloCache } from '@apollo/client'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { REMOVE_RECIPE, SAVE_RECIPE } from '../../lib/apollo/graphQL/mutations'
import { GET_SAVED_RECIPES } from '../../lib/apollo/graphQL/queries'
import type { SavedRecipe } from '../../lib/apollo/graphQL/typedefs'
import type { RecipeInput } from '../../types/payloads'

export const SAVE_FAILED = "Couldn't update your saved recipes. Try again."

/** The library ids with a heart. */
export const savedLibraryIds = (
  recipes: readonly Pick<SavedRecipe, 'libraryId'>[]
): ReadonlySet<string> =>
  new Set(recipes.flatMap((r) => (r.libraryId === null ? [] : [r.libraryId])))

/** The cached saved recipes with a change applied; nothing happens before the first read. */
export const updateSaved = (
  cache: ApolloCache<unknown>,
  change: (recipes: readonly SavedRecipe[]) => SavedRecipe[]
): void => {
  cache.updateQuery({ query: GET_SAVED_RECIPES }, (data) =>
    data === null ? data : { getSavedRecipes: change(data.getSavedRecipes) }
  )
}

/** Saved recipes and the heart's toggle; signed out there are none and nothing is asked. */
export const useSaved = (loggedIn: boolean) => {
  const { data } = useQuery(GET_SAVED_RECIPES, { skip: !loggedIn })
  const recipes = data?.getSavedRecipes ?? []
  const [error, setError] = useState('')
  const { cache } = useApolloClient()
  const [save] = useMutation(SAVE_RECIPE, {
    onCompleted: ({ saveRecipe }) =>
      updateSaved(cache, (all) => [...all, saveRecipe])
  })
  const [remove] = useMutation(REMOVE_RECIPE)
  const ids = savedLibraryIds(recipes)
  const fail = () => setError(SAVE_FAILED)
  const unsave = (libraryId: string) =>
    recipes
      .filter((recipe) => recipe.libraryId === libraryId)
      .forEach((recipe) => {
        remove({
          variables: { recipeId: recipe._id },
          update: (cache) =>
            updateSaved(cache, (all) => all.filter((r) => r._id !== recipe._id))
        }).catch(fail)
      })
  return {
    ids,
    error,
    toggle: (libraryId: string, input: RecipeInput): void => {
      setError('')
      if (ids.has(libraryId)) {
        unsave(libraryId)
        return
      }
      save({ variables: { input } }).catch(fail)
    }
  }
}

export type SavedState = ReturnType<typeof useSaved>
