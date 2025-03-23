import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecipeInput } from 'types/payloads'
import { SAVE_RECIPE, UPDATE_RECIPE } from 'lib/apollo/graphQL/mutations'
import { GET_SAVED_RECIPES } from 'lib/apollo/graphQL/queries'
import { useStoreContext } from 'utils/state/GlobalState'
import { ADD_SAVED_RECIPE } from 'utils/state/actions'

export const useCustomise = () => {
  const [fields, setFields] = React.useState<{
    name: string
    portions: string
    ingredients: Array<{
      name: string
      quantity: number
      measure: string
      category: string
    }>
  }>({
    name: '',
    portions: '',
    ingredients: [
      {
        name: '',
        quantity: 0,
        measure: '',
        category: ''
      }
    ]
  })

  const [saveRecipe, { error: saveRecipeError }] = useMutation(SAVE_RECIPE, {
    refetchQueries: [{ query: GET_SAVED_RECIPES }]
  })

  const [updateRecipe, { error: updateRecipeError }] =
    useMutation(UPDATE_RECIPE)

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [state, dispatch] = useStoreContext()

  const handleClearAll = () => {
    setFields({
      name: '',
      portions: '',
      ingredients: [
        {
          name: '',
          quantity: 0,
          measure: '',
          category: ''
        }
      ]
    })
  }

  const handleUndoAll = () => {
    setFields(state.customiseRecipe)
  }

  const navigate = useNavigate()
  const handleBack = () => {
    setCancel(true)
    navigate(-1)
  }

  const [cancel, setCancel] = useState(false)

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    console.log({ e })
    if (cancel) return

    try {
      console.log('onFinish', fields)
      const input = {
        name: fields.name || 'Custom recipe',
        portions: fields.portions ? Math.floor(Number(fields.portions)) : 1,
        ingredients: fields.ingredients.map((i) => {
          const name = i.name || 'Ingredient'
          const quantity = Math.floor(i.quantity * 100) / 100
          const measure = i.measure || 'unit'
          const category = i.category || 'Generic'
          const ingredient = { name, quantity, measure, category }
          return ingredient
        }),
        instructions: '',

        picture_url:
          state.customiseRecipe?.picture_url ||
          'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc',
        edamamId: state.customiseRecipe?.edamamId || '-1'
      } as RecipeInput

      console.log('[onFinish] input = ', input)

      if (state.customiseRecipe?._id) {
        //* Already saved on server - need to update
        setLoading(true)
        const recipeId = state.customiseRecipe._id
        const payload = { variables: { input, recipeId } }
        console.log('[onFinish] Update existing recipe', payload)
        payload.variables.recipeId = state.customiseRecipe?._id
        const res = await updateRecipe(payload)
        const data = res.data.updateRecipe
        console.log('[onFinish] Update - res', data)
        if (updateRecipeError) throw updateRecipeError
      } else {
        //* Not yet saved on server
        setLoading(true)
        const payload = { variables: { input } }
        console.log('[onFinish] Create new recipe', payload)
        const res = await saveRecipe(payload)
        const data = res.data.saveRecipe

        console.log('[onFinish] Create - res', data)
        if (saveRecipeError) throw saveRecipeError
        dispatch({ type: ADD_SAVED_RECIPE, data })
      }
      setLoading(false)

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
      }, 1000)
    } catch (error) {
      console.error(error)
    }
  }
  return {
    onFinish,
    setFields,
    fields,
    handleClearAll,
    handleUndoAll,
    saved,
    loading,
    handleBack
  }
}
