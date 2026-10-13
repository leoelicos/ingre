import { useLazyQuery, useMutation } from '@apollo/client'
import type { ClientRecipe } from '../../../types/client'
import { REMOVE_RECIPE } from '../../../lib/apollo/graphQL/mutations'
import {
  GET_RECIPE,
  GET_SAVED_RECIPES
} from '../../../lib/apollo/graphQL/queries'
import { SAVE_RECIPE } from '../../../lib/apollo/graphQL/useSaveRecipe'
import { toRecipeInput } from './toRecipeInput'
import { useStoreContext } from '../../../utils/state/GlobalState'
import {
  ADD_SAVED_RECIPE,
  REMOVE_SAVED_RECIPE,
  SET_EDIT_RECIPE
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

  const [getRecipe, { loading: getRecipeLoading, error: getRecipeError }] =
    useLazyQuery(GET_RECIPE, {
      fetchPolicy: 'network-only'
      // nextFetchPolicy: 'cache-first'
    })
  const handleEdit = async () => {
    let data = recipe
    if (recipe._id) {
      try {
        const res = await getRecipe({ variables: { id: recipe._id } })
        if (res) {
          data = res.data.getRecipe
          dispatch({ type: SET_EDIT_RECIPE, data: data })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleSave = async () => {
    try {
      const res = await saveRecipe({
        variables: { input: toRecipeInput(recipe) }
      })
      if (!res) throw new Error('Could not save recipe')
      const saveData = res.data.saveRecipe
      dispatch({ type: ADD_SAVED_RECIPE, data: saveData })
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemove = async () => {
    try {
      let _id
      if (onSavedPage) {
        _id = recipe._id
      } else {
        _id = state.savedRecipes.find(
          (r) => r.libraryId === recipe.libraryId
        )?._id
      }
      const payload = { variables: { recipeId: _id } }
      const res = await removeRecipe(payload)
      if (!res) throw new Error('Could not save recipe')
      dispatch({ type: REMOVE_SAVED_RECIPE, data: recipe.libraryId }) // this won't work if it doesn't have libraryId
    } catch (error) {
      console.error(Error)
    }
  }

  return {
    getRecipeError,
    getRecipeLoading,
    handleEdit,
    handleSave,
    handleRemove,
    savedRecipes: state.savedRecipes,
    saveRecipeLoading
  }
}
