import type { ClientRecipe, ClientIngredient } from '../../types/client'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isIngredient(value: unknown): value is ClientIngredient {
  if (!isRecord(value)) return false
  return (
    typeof value['name'] === 'string' &&
    typeof value['quantity'] === 'number' &&
    typeof value['measure'] === 'string' &&
    typeof value['category'] === 'string'
  )
}

export function isClientRecipe(value: unknown): value is ClientRecipe {
  if (!isRecord(value)) return false
  return (
    typeof value['name'] === 'string' &&
    typeof value['portions'] === 'number' &&
    typeof value['picture_url'] === 'string' &&
    Array.isArray(value['ingredients']) &&
    value['ingredients'].every(isIngredient)
  )
}

export function isClientRecipeList(value: unknown): value is ClientRecipe[] {
  return Array.isArray(value) && value.every(isClientRecipe)
}
