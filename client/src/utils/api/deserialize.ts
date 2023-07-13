/* convert EdamamHit to Recipe */

import type { EdamamHit } from '../../@types/edamam.d.ts'
import type { ClientRecipe } from '../../@types/client'

/* const placeholder =
  'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc' */

const deserialize: (hits: EdamamHit[]) => ClientRecipe[] = (hits) =>
  hits.map((hit) => ({
    _id: undefined,
    name: hit.recipe.label,
    portions: hit.recipe.yield,
    picture_url: hit.recipe.images.LARGE.url,
    instructions: hit.recipe.shareAs,
    ingredients: hit.recipe.ingredients.map((i) => ({
      _id: undefined,
      name: i.food,
      quantity: i.quantity,
      measure: i.measure,
      category: i.foodCategory
    })),
    edamamId: hit.recipe.uri.split('recipe_')[1]
  }))

export default deserialize
