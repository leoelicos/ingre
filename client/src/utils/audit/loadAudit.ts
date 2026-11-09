/*
 * How the audit table gets its rows. The recipe catalogue ships with the app (there is no
 * recipe query on the API), so the rows are built on demand in their own lazily loaded chunk:
 * the table's code costs nothing until someone opens it, and the table already handles the
 * loading and failure states a network query would have.
 */
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
  const [{ auditRows }, { catalogue, library }] = await Promise.all([
    import('./measurementAudit'),
    import('../library/recipeLibrary')
  ])
  const recipe = library.find((r) => r.id === recipeId)
  if (recipe === undefined) throw new UnknownRecipeError(recipeId)
  return auditRows(recipe, catalogue)
}
