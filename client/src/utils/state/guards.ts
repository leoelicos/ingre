import type { ClientRecipe, ClientIngredient } from '../../types/client'
import type { savedIngredientType } from '../compress'

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
    Array.isArray(value['tags']) &&
    value['tags'].every((tag) => typeof tag === 'string') &&
    Array.isArray(value['ingredients']) &&
    value['ingredients'].every(isIngredient)
  )
}

export function isClientRecipeList(value: unknown): value is ClientRecipe[] {
  return Array.isArray(value) && value.every(isClientRecipe)
}

export function toSavedIngredient(value: unknown): savedIngredientType | null {
  if (!isRecord(value)) return null
  const { _id, name, quantity, measure, category, recipe, recipeId } = value
  if (typeof _id !== 'string') return null
  if (typeof name !== 'string') return null
  if (typeof quantity !== 'string' && typeof quantity !== 'number') return null
  if (typeof measure !== 'string') return null
  if (!isRecord(category) || typeof category['name'] !== 'string') return null
  if (typeof recipe !== 'string') return null
  if (typeof recipeId !== 'string') return null
  return {
    _id,
    name,
    quantity: String(quantity),
    measure,
    category: { name: category['name'] },
    recipe,
    recipeId
  }
}

export function savedIngredientsFromUnknown(
  values: unknown
): savedIngredientType[] {
  if (!Array.isArray(values)) return []
  return values.flatMap((value) => {
    const ingredient = toSavedIngredient(value)
    return ingredient === null ? [] : [ingredient]
  })
}
