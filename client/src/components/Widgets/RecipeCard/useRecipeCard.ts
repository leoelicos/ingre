import { useEffect } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import type { ClientRecipe } from 'types/client'
import { REMOVE_RECIPE, SAVE_RECIPE } from 'lib/apollo/graphQL/mutations'
import { GET_RECIPE, GET_SAVED_RECIPES } from 'lib/apollo/graphQL/queries'
import { useStoreContext } from 'utils/state/GlobalState'
import {
  ADD_SAVED_RECIPE,
  REMOVE_SAVED_RECIPE,
  SET_EDIT_RECIPE
} from 'utils/state/actions'

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
  const [
    removeRecipe,
    { loading: removeRecipeLoading, error: removeRecipeError }
  ] = useMutation(REMOVE_RECIPE, {
    refetchQueries: [{ query: GET_SAVED_RECIPES }]
  })

  if (removeRecipeError) console.error({ removeRecipeError })

  const [state, dispatch] = useStoreContext()

  const [getRecipe, { loading: getRecipeLoading, error: getRecipeError }] =
    useLazyQuery(GET_RECIPE, {
      fetchPolicy: 'network-only'
      // nextFetchPolicy: 'cache-first'
    })
  useEffect(() => {
    if (getRecipeLoading) console.log({ getRecipeLoading, getRecipeError })
  }, [getRecipeLoading, getRecipeError])
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
        console.log(error)
      }
    }
  }

  const handleSave = async () => {
    try {
      const defaultIngredient = {
        _id: undefined,
        name: 'Ingredient',
        quantity: 1,
        measure: 'unit',
        category: 'Generic'
      }
      const defaultRecipe: ClientRecipe = {
        _id: undefined,
        name: 'Untitled Recipe',
        portions: 1,
        picture_url:
          'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc',
        edamamId: undefined,
        instructions: undefined,
        ingredients: [defaultIngredient]
      }

      const res = await saveRecipe({
        variables: {
          input: {
            name: recipe.name.length > 0 ? recipe.name : defaultRecipe.name,
            portions:
              recipe.portions > 0 ? recipe.portions : defaultRecipe.portions,
            picture_url:
              recipe.picture_url.length > 0
                ? recipe.picture_url
                : defaultRecipe.picture_url,
            edamamId:
              recipe.edamamId !== undefined
                ? recipe.edamamId
                : defaultRecipe.edamamId,
            instructions:
              recipe.instructions === undefined ||
              recipe.instructions.length === 0
                ? defaultRecipe.instructions
                : recipe.instructions,
            ingredients: recipe.ingredients.map((i) => ({
              name: i.name.length > 0 ? i.name : defaultIngredient.name,
              quantity:
                i.quantity > 0 ? i.quantity : defaultIngredient.quantity,
              measure: i.measure || defaultIngredient.measure,
              category: i.category ? i.category : defaultIngredient.category
            }))
          }
        }
      })
      if (!res) throw new Error('Could not save recipe')
      const saveData = res.data.saveRecipe
      console.log({ res }) // this is returning null
      dispatch({ type: ADD_SAVED_RECIPE, data: saveData })
    } catch (error) {
      console.error(error)
      console.log('error here')
    }
  }

  const handleRemove = async () => {
    try {
      let _id
      if (onSavedPage) {
        _id = recipe._id
      } else {
        _id = state.savedRecipes.find((r) => r.edamamId === recipe.edamamId)._id
      }
      const payload = { variables: { recipeId: _id } }
      const res = await removeRecipe(payload)
      if (!res) throw new Error('Could not save recipe')
      dispatch({ type: REMOVE_SAVED_RECIPE, data: recipe.edamamId }) // this won't work if it doesn't have edamamId
    } catch (error) {
      console.error(Error)
    }
  }

  return {
    getRecipeError,
    getRecipeLoading,
    handleEdit,
    handleSave,
    savedRecipes: state.savedRecipes,
    saveRecipeLoading
  }
}
