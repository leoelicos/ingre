import { gql, useMutation } from '@apollo/client'
import { useStoreContext } from '../../../utils/state/GlobalState'
import { ADD_SAVED_RECIPE } from '../../../utils/state/actions'
import { toClientRecipe } from '../../../utils/toClientRecipe'
import type { Operation, Recipe, RecipeVariables } from './typedefs'

export const SAVE_RECIPE: Operation<
  { saveRecipe: Recipe },
  RecipeVariables
> = gql`
  mutation SaveRecipe($input: RecipeInput!) {
    saveRecipe(input: $input) {
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

export const useSaveRecipe = () => {
  const [, dispatch] = useStoreContext()
  const [saveRecipe, { loading: saveRecipeLoading, error: saveRecipeError }] =
    useMutation(SAVE_RECIPE, {
      onCompleted: (data) => {
        console.log({ data })
        dispatch({
          type: ADD_SAVED_RECIPE,
          data: toClientRecipe(data.saveRecipe)
        })
      },
      onError: (error) => {
        console.error({ error })
      }
    })
  return { saveRecipe, saveRecipeLoading, saveRecipeError }
}
