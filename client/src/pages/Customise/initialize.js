/* initialize the Customise form
      recipes from Recipes Page are initialised from client data
      recipes from Saved Page are initialised from server data
      recipes from Search Page are initialised from client data
  */

import { SET_EDIT_RECIPE } from '../../utils/state/actions.ts'

const fallbackIngredient = {
  name: 'Ingredient',
  quantity: 1,
  measure: 'Measure',
  category: 'Category'
}
const fallbackRecipe = {
  key: 'Recipe',
  name: 'Recipe',
  portions: 1,
  ingredients: [fallbackIngredient]
}

const initialize = async () => {
  const id = state?.customiseRecipe?._id || undefined
  const fromServer = id !== undefined

  if (fromServer) {
    console.log('[Customise] initialize from server', state.customiseRecipe)
    const res = await getRecipe({ variables: { id } })
    if (!res?.data?.getRecipe) return fallbackRecipe
    else {
      const r = res.data.getRecipe
      const recipe = {
        key: r.name,
        name: r.name,
        portions: r.portions,
        ingredients: r.ingredients?.map((v) => ({
          ...v,
          category: v.category.name
        }))
      }
      dispatch({ type: SET_EDIT_RECIPE, data: recipe })
      return recipe
    }
  } else {
    console.log('[Customise] initialize from client', state.customiseRecipe)
    setInit({
      name: state?.customiseRecipe?.name || '',
      portions: state?.customiseRecipe?.portions || 2,
      ingredients: state?.customiseRecipe?.ingredients?.map((v, i) => {
        const ingredient = {
          key: 'ingredient' + i,
          name: v.name || 'ingredient',
          quantity: v.quantity > 0 ? Math.round(v.quantity * 100) / 100 : 1,
          measure: v.measure || 'unit',
          category: v.category.name || 'Generic'
        }
        return ingredient
      }) || [fallbackIngredient]
    })
  }
}

export default initialize
