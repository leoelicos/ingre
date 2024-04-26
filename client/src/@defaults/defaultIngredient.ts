import type { ClientIngredient } from '../@types/client.d.ts'

const defaultIngredient: ClientIngredient = {
  _id: undefined,
  name: 'Ingredient',
  quantity: 1,
  measure: 'unit',
  category: { name: 'Generic' }
}
export default defaultIngredient
