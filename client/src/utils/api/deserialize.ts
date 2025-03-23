/* convert EdamamHit to Recipe */

import type { ClientRecipe } from 'types/client'
import type { EdamamHit } from 'types/edamam'

const placeholder =
  'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'

const deserialize = (hits: EdamamHit[]): Array<ClientRecipe> =>
  hits.map((hit) => ({
    _id: undefined,
    name: hit.recipe.label || 'unnamed recipe',
    portions: hit.recipe.yield || 1,
    picture_url: hit.recipe.images?.LARGE?.url || placeholder,
    instructions: hit.recipe.shareAs,
    ingredients:
      hit.recipe.ingredients?.map((i) => ({
        _id: undefined,
        name: i.food || 'unnamed ingredient',
        quantity: i.quantity || 1,
        measure: i.measure || 'unit',
        category: i.foodCategory || 'unnamed category'
      })) || [],
    edamamId: hit.recipe.uri?.split('recipe_')[1]
  }))

export default deserialize
