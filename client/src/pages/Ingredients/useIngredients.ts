import { useApolloClient, useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import type { IngredientGeneratedTypeWithKey } from '../../types/ingredientGenerated'
import { toClientRecipe } from '../../utils/toClientRecipe'
import { GET_RECIPE, GET_SAVED_RECIPES } from '../../lib/apollo/graphQL/queries'
import { changeTitle } from '../../utils/changeTitle'
import { useStoreContext } from '../../utils/state/GlobalState'
import {
  FLAG_INGREDIENTS_GENERATED,
  UPDATE_SAVED_INGREDIENTS,
  UPDATE_SAVED_RECIPES
} from '../../utils/state/actions'

export const useIngredients = () => {
  useEffect(() => {
    changeTitle('Ingredients')
  }, [])

  const [state, dispatch] = useStoreContext()
  const [updateRecipes, setUpdateRecipes] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState(state.savedRecipes)
  const [dataSource, setDataSource] = useState(state.savedIngredients)
  const [count, setCount] = useState(2)

  const client = useApolloClient()
  const [
    getSavedRecipes,
    {
      loading: savedRecipeLoading,
      error: savedRecipeError,
      data: savedRecipeData
    }
  ] = useLazyQuery(GET_SAVED_RECIPES, {
    fetchPolicy: 'network-only'
    // nextFetchPolicy: 'cache-first'
  })
  const reload = async () => {
    try {
      const savedIngredientArray: IngredientGeneratedTypeWithKey[] = []
      for (const recipe of savedRecipes) {
        const recipeName = recipe.name
        const recipeId = recipe._id
        if (recipeId === undefined) continue
        const res = await client.query({
          query: GET_RECIPE,
          variables: { id: recipeId }
        })
        /* push serialized into savedIngredient[] */
        res.data.getRecipe.ingredients.forEach((ingredient) => {
          const { _id, name, quantity, measure, category } = ingredient
          const savedIngredient = {
            _id,
            name,
            quantity,
            measure,
            category: { name: category.name },
            recipe: recipeName,
            recipeId,
            key: _id
          }
          savedIngredientArray.push(savedIngredient)
        })
      }
      setDataSource(savedIngredientArray)
      dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: savedIngredientArray })
    } catch (error) {
      console.error(error)
    }
  }
  const handleAdd = () => {
    const newData = {
      key: count,
      name: '_____',
      quantity: '_____',
      measure: '_____',
      category: '_____',
      recipe: 'Extra'
    }
    const newIngredients = [...dataSource, newData]
    setDataSource(newIngredients)
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newIngredients })
    setCount(count + 1)
  }

  const onFinish = () => {
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: dataSource })
  }
  useEffect(() => {
    if (updateRecipes) {
      dispatch({ type: UPDATE_SAVED_RECIPES, data: savedRecipes })
      setUpdateRecipes(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateRecipes, savedRecipes])

  // update local savedRecipes when getSavedRecipes is loaded from server
  useEffect(() => {
    if (!savedRecipeLoading && !savedRecipeError && savedRecipeData) {
      setSavedRecipes(savedRecipeData.getSavedRecipes.map(toClientRecipe))
      setUpdateRecipes(true)
    }
  }, [savedRecipeLoading, savedRecipeError, savedRecipeData])

  // run on first load
  useEffect(() => {
    if (state.ingredientsDidGenerate) return
    const generateOnFirstLoad = async () => {
      dispatch({ type: FLAG_INGREDIENTS_GENERATED, data: undefined })
      await getSavedRecipes()
      await reload()
      setUpdateRecipes(true)
    }
    generateOnFirstLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return {
    savedRecipeLoading,
    savedRecipeError,
    dataSource,
    reload,
    onFinish,
    handleAdd
  }
}
