/* data */
import { useApolloClient } from '@apollo/client'

/* type */
import type { RecipeType } from '../../@types/recipe.d.ts'

/* state */
import { GET_RECIPE } from '../../utils/apollo/queries.ts'

export const getRecipeFromServer: (
  id: string
) => Promise<RecipeType | undefined> = async (id) => {
  try {
    const client = useApolloClient()

    const res = await client.query({
      query: GET_RECIPE,
      variables: { id }
    })
    if (!res) return undefined
    if (!res.data) return undefined
    if (!res.data.getRecipe) return undefined
    const data: RecipeType = res.data.getRecipe
    return data
  } catch (error) {
    console.error(error)
  }
}
