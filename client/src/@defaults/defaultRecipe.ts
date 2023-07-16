import type { ClientRecipe } from '../@types/client.d.ts'
import defaultIngredient from './defaultIngredient.ts'

const placeholder =
  'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
const defaultRecipe: ClientRecipe = {
  _id: undefined,
  name: 'Untitled Recipe',
  portions: 1,
  picture_url: placeholder,
  edamamId: undefined,
  instructions: undefined,
  ingredients: [defaultIngredient]
}

export default defaultRecipe
