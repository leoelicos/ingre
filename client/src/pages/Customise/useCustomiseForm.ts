import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecipeInput } from '../../types/payloads'
import { useStoreContext } from '../../utils/state/GlobalState'

type UpdateRecipe = (options: {
  variables: { input: RecipeInput; recipeId: string }
}) => unknown

type SaveRecipeFn = (options: { variables: { input: RecipeInput } }) => unknown

const defaultIngredient = {
  name: '',
  quantity: 1,
  measure: '',
  category: ''
}
const defaultCustomiseFields = {
  name: '',
  portions: 1,
  ingredients: [defaultIngredient]
}

export const useCustomiseForm = ({
  updateRecipe,
  saveRecipe
}: {
  updateRecipe: UpdateRecipe
  saveRecipe: SaveRecipeFn
}) => {
  const [state] = useStoreContext()
  const [name, setName] = useState(defaultCustomiseFields.name)
  const [portions, setPortions] = useState(defaultCustomiseFields.portions)
  const [ingredients, setIngredients] = useState(
    defaultCustomiseFields.ingredients
  )
  const [cancel, setCancel] = useState(false)
  const [saved, setSaved] = useState(false)

  const navigate = useNavigate()

  const handleClearAll = () => {
    setName(defaultCustomiseFields.name)
    setPortions(defaultCustomiseFields.portions)
    setIngredients(defaultCustomiseFields.ingredients)
  }

  const handleUndoAll = () => {
    setName(state.customiseRecipe?.name ?? '')
  }

  const handleBack = () => {
    setCancel(true)
    navigate(-1)
  }

  const onNameChange = (e: { target: { value: string } }) => {
    setName(e.target.value)
  }
  const onPortionsChange = (e: { target: { value: string } }) => {
    setPortions(parseFloat(e.target.value))
  }
  const onIngredientsChange = ({
    idx,
    newObject
  }: {
    idx: number
    newObject:
      | { name: string }
      | { quantity: number }
      | { measure: string }
      | { category: string }
  }) => {
    setIngredients((prev) =>
      prev.map((v, i) => {
        return i === idx ? { ...v, ...newObject } : v
      })
    )
  }

  const onDeleteIngredient = ({ idx }: { idx: number }) => {
    setIngredients((prev) => prev.filter((_v, i) => i !== idx))
  }

  //! Can't seem to add an ingredient - it rerenders to the previous one
  const onAddIngredient = () => {
    setIngredients((prev) => [...prev, defaultIngredient])
  }

  const onFinish = async () => {
    if (cancel) return

    try {
      const input: RecipeInput = {
        name: name || 'Custom recipe',
        portions: portions || 1,
        ingredients: ingredients.map((i) => ({
          name: i.name || 'Ingredient',
          quantity: i.quantity || 1,
          measure: i.measure || 'unit',
          category: i.category || 'Generic'
        })),
        instructions: '',
        picture_url:
          state.customiseRecipe?.picture_url ||
          'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc',
        libraryId: state.customiseRecipe?.libraryId || '-1'
      }

      //* if already saved, update, otherwise save
      if (state.customiseRecipe?._id) {
        updateRecipe({
          variables: { input, recipeId: state.customiseRecipe._id }
        })
      } else {
        saveRecipe({ variables: { input } })
      }

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
      }, 1000)
    } catch (error) {
      console.error(error)
    }
  }

  return {
    handleClearAll,
    handleUndoAll,
    name,
    onNameChange,
    portions,
    onPortionsChange,
    ingredients,
    onIngredientsChange,
    onDeleteIngredient,
    onAddIngredient,
    onFinish,
    handleBack,
    saved
  }
}
