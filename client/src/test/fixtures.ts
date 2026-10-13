import type { ClientIngredient, ClientRecipe } from '../types/client'

export function ingredient(
  overrides: Partial<ClientIngredient> = {}
): ClientIngredient {
  return {
    _id: 'ing1',
    name: 'Tomato',
    quantity: 1,
    measure: 'cup',
    category: 'produce',
    ...overrides
  }
}

export function recipe(overrides: Partial<ClientRecipe> = {}): ClientRecipe {
  return {
    _id: 'id1',
    name: 'Pasta',
    portions: 2,
    picture_url: 'http://pic.example/pasta.jpg',
    instructions: 'Boil',
    edamamId: 'ed1',
    ingredients: [ingredient()],
    ...overrides
  }
}
