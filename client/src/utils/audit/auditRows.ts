/* Builds the measurement audit's rows from the catalogue; loaded on demand (loadAudit). */
import type {
  Amount,
  LibraryIngredient,
  LibraryRecipe
} from '../../types/library'
import { convert, toBase } from '../shopping/units'
import type { AuditRow } from './measurementAudit'

/** The line's amount per serve as grams or millilitres; counted items go through approxGrams. */
export const perServeOf = (
  quantity: number,
  measure: string,
  item: LibraryIngredient | null
): Amount | null => {
  const base = item === null ? null : toBase(quantity, measure, item)
  if (item === null || base === null) return null
  if (base.unit !== 'count') return base
  const grams = convert(base, 'g', item)
  return grams === null ? null : { amount: grams, unit: 'g' }
}

/** The smallest sized pack, in the unit of the first sized option (the unit the item totals in). */
export const smallestPack = (item: LibraryIngredient | null): Amount | null => {
  const sizes = (item?.sold ?? []).flatMap((option) =>
    option.size === null ? [] : [option.size]
  )
  const unit = sizes[0]?.unit
  return (
    sizes
      .filter((size) => size.unit === unit)
      .sort((a, b) => a.amount - b.amount)[0] ?? null
  )
}

/** How much of the pack one serve uses, or null when either side is unknown or will not convert. */
export const shareOf = (
  perServe: Amount | null,
  pack: Amount | null,
  item: LibraryIngredient | null
): number | null => {
  if (perServe === null || pack === null || item === null) return null
  const used = convert(perServe, pack.unit, item)
  return used === null ? null : used / pack.amount
}

/** The audit rows for a recipe, in the recipe's own order. */
export const auditRows = (
  recipe: LibraryRecipe,
  items: readonly LibraryIngredient[]
): AuditRow[] => {
  const byId = new Map(items.map((item) => [item.id, item]))
  return recipe.ingredients.map(({ ingredientId, quantity, measure }) => {
    const item = byId.get(ingredientId) ?? null
    const perServe = perServeOf(quantity, measure, item)
    const pack = smallestPack(item)
    return {
      ingredientId,
      name: item?.name ?? ingredientId,
      item,
      quantity,
      measure,
      perServe,
      pack,
      share: shareOf(perServe, pack, item)
    }
  })
}
