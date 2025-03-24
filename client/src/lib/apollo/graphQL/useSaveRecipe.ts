import { gql, useMutation } from '@apollo/client'
import { useStoreContext } from 'utils/state/GlobalState'
import { ADD_SAVED_RECIPE } from 'utils/state/actions'

export const SAVE_RECIPE = gql`
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
      edamamId
      instructions
    }
  }
`

export const useSaveRecipe = () => {
  const [_state, dispatch] = useStoreContext()
  const [saveRecipe, { loading: saveRecipeLoading, error: saveRecipeError }] =
    useMutation(SAVE_RECIPE, {
      onCompleted: (data) => {
        console.log({ data })
        dispatch({ type: ADD_SAVED_RECIPE, data: data.saveRecipe })
      },
      onError: (error) => {
        console.error({ error })
      }
    })
  return { saveRecipe, saveRecipeLoading, saveRecipeError }
}
