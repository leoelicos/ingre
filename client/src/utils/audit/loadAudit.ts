/*
 * How the audit table gets its rows. The recipe catalogue ships with the app (there is no
 * recipe query on the API), so the rows are built on demand by a lazily loaded chunk, and the
 * table handles the loading and failure states a network query would have. Swapping this for
 * a GraphQL query later changes this file only.
 */
import { catalogue, library } from '../library/recipeLibrary'
import type { AuditRow } from './measurementAudit'

export type LoadAudit = (recipeId: string) => Promise<readonly AuditRow[]>

/** Thrown when the id names no recipe in the catalogue. */
export class UnknownRecipeError extends Error {
  constructor(recipeId: string) {
    super(`No recipe with id "${recipeId}"`)
    this.name = 'UnknownRecipeError'
  }
}

export const loadAudit: LoadAudit = async (recipeId) => {
  const { auditRows } = await import('./auditRows')
  const recipe = library.find((r) => r.id === recipeId)
  if (recipe === undefined) throw new UnknownRecipeError(recipeId)
  return auditRows(recipe, catalogue)
}
