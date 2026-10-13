import { IngredientInput } from '../schemas/types'

export const DEFAULT_INGREDIENT: IngredientInput = {
  name: 'Generic',
  quantity: 1,
  measure: 'unit',
  category: 'Generic'
}

/** Replaces falsy ingredient fields with their defaults. */
export const withIngredientDefaults = (
  input: IngredientInput
): IngredientInput => ({
  name: input.name || DEFAULT_INGREDIENT.name,
  quantity: input.quantity || DEFAULT_INGREDIENT.quantity,
  measure: input.measure || DEFAULT_INGREDIENT.measure,
  category: input.category || DEFAULT_INGREDIENT.category
})

/** Keeps the values of fulfilled promises, dropping rejections. */
export const fulfilledValues = <T>(
  results: ReadonlyArray<PromiseSettledResult<T>>
): T[] =>
  results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : []
  )
