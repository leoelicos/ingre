import { useMutation } from '@apollo/client'
import type { ClientRecipe } from '../../../types/client'
import {
  REMOVE_RECIPE,
  SAVE_RECIPE
} from '../../../lib/apollo/graphQL/mutations'
import { GET_SAVED_RECIPES } from '../../../lib/apollo/graphQL/queries'
import { toClientRecipe } from '../../../utils/toClientRecipe'
import { toRecipeInput } from './toRecipeInput'
import { useStoreContext } from '../../../utils/state/GlobalState'
import {
  ADD_SAVED_RECIPE,
  REMOVE_SAVED_RECIPE
} from '../../../utils/state/actions'

export const useRecipeCard = ({
  onSavedPage,
  recipe
}: {
  onSavedPage: boolean
  recipe: ClientRecipe
}) => {
  const [saveRecipe, { loading: saveRecipeLoading, error: saveRecipeError }] =
    useMutation(SAVE_RECIPE, {
      refetchQueries: [{ query: GET_SAVED_RECIPES }]
    })
  if (saveRecipeError) console.error('saveRecipeError', { saveRecipeError })
  const [removeRecipe, { error: removeRecipeError }] = useMutation(
    REMOVE_RECIPE,
    {
      refetchQueries: [{ query: GET_SAVED_RECIPES }]
    }
  )

  if (removeRecipeError) console.error({ removeRecipeError })

  const [state, dispatch] = useStoreContext()

  const handleSave = async () => {
    try {
      const res = await saveRecipe({
        variables: { input: toRecipeInput(recipe) }
      })
      if (!res.data) throw new Error('Could not save recipe')
      dispatch({
        type: ADD_SAVED_RECIPE,
        data: toClientRecipe(res.data.saveRecipe)
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemove = async () => {
    try {
      const recipeId = onSavedPage
        ? recipe._id
        : state.savedRecipes.find((r) => r.libraryId === recipe.libraryId)?._id
      if (recipeId === undefined) throw new Error('Recipe is not saved')
      await removeRecipe({ variables: { recipeId } })
      dispatch({ type: REMOVE_SAVED_RECIPE, data: recipe.libraryId }) // this won't work if it doesn't have libraryId
    } catch (error) {
      console.error(error)
    }
  }

  return {
    handleSave,
    handleRemove,
    savedRecipes: state.savedRecipes,
    saveRecipeLoading
  }
}
