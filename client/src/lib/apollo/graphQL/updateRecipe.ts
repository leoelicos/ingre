import { gql, useMutation } from '@apollo/client'
import { GET_SAVED_RECIPES } from './queries'
import type { Operation, Recipe, RecipeVariables } from './typedefs'

export const UPDATE_RECIPE: Operation<
  { updateRecipe: Recipe },
  RecipeVariables & { recipeId: string }
> = gql`
  mutation UpdateRecipe($input: RecipeInput!, $recipeId: ID!) {
    updateRecipe(input: $input, recipeId: $recipeId) {
      _id
      name
      portions
      ingredients {
        _id
        name
        quantity
        measure
        category {
          _id
          name
        }
      }
      picture_url
      libraryId
      instructions
    }
  }
`

export const useUpdateRecipe = () => {
  const [
    updateRecipe,
    { loading: updateRecipeLoading, error: updateRecipeError }
  ] = useMutation(UPDATE_RECIPE, {
    refetchQueries: [{ query: GET_SAVED_RECIPES }],
    onCompleted: (data) => {
      console.log({ data })
    },
    onError: (error) => {
      console.error({ error })
    }
  })
  return { updateRecipe, updateRecipeLoading, updateRecipeError }
}
