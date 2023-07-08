/* returns promisified graphQL functions that are typed according to backend graphQL typedefs */

/* data */
import { useApolloClient } from '@apollo/client'
import { GET_RECIPE } from './queries.ts'

/* type */
import type { RecipeType } from '../../@types/recipe'

type getRecipeType = (id: string) => Promise<RecipeType | undefined>

export const getRecipe: getRecipeType = async (id) => {
  try {
    const client = useApolloClient()

    const res = await client.query({
      query: GET_RECIPE,
      variables: { id }
    })
    if (!res) return undefined
    if (!res.data) return undefined
    if (!res.data.getRecipe) return undefined
    return res.data.getRecipe
  } catch (error) {
    console.error(error)
  }
}
