/*
 * The measurement audit: one row per ingredient line of a recipe, per serve, with what it weighs
 * and how much of the smallest pack it uses. Read-only: it checks the catalogue, it never edits it.
 */
import type {
  Amount,
  LibraryIngredient,
  LibraryRecipe
} from '../../types/library'
import { convert, toBase } from '../shopping/units'

/** One ingredient line as the audit table shows it. */
export interface AuditRow {
  readonly ingredientId: string
  readonly name: string
  /** the catalogue item, or null when the line names an id the catalogue does not have */
  readonly item: LibraryIngredient | null
  /** per serve, in the recipe's own measure */
  readonly quantity: number
  readonly measure: string
  /** per serve in grams (or millilitres for liquids), or null when it cannot be worked out */
  readonly perServe: Amount | null
  /** the smallest pack the shops sell, or null when the item is only sold loose */
  readonly pack: Amount | null
  /** the part of that pack one serve uses (0.25 is a quarter), or null when unknown */
  readonly share: number | null
}

/** The columns a reader can sort by, in table order. */
export type AuditColumn =
  | 'name'
  | 'quantity'
  | 'unit'
  | 'perServe'
  | 'pack'
  | 'share'

export const AUDIT_COLUMNS: readonly AuditColumn[] = [
  'name',
  'quantity',
  'unit',
  'perServe',
  'pack',
  'share'
]

export type SortDirection = 'ascending' | 'descending'

export interface AuditSort {
  readonly column: AuditColumn
  readonly direction: SortDirection
}

/** Rows per page a reader can choose; five by default, so most recipes run to two pages. */
export const DEFAULT_PAGE_SIZE = 5
export const PAGE_SIZES: readonly number[] = [DEFAULT_PAGE_SIZE, 10, 20]

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

type Key = number | string | null

/** The value a column sorts by; null means unknown. */
const keyOf = (row: AuditRow, column: AuditColumn): Key => {
  switch (column) {
    case 'name':
      return row.name
    case 'quantity':
      return row.quantity
    case 'unit':
      return row.measure
    case 'perServe':
      return row.perServe?.amount ?? null
    case 'pack':
      return row.pack?.amount ?? null
    case 'share':
      return row.share
  }
}

const compareKeys = (a: Key, b: Key): number =>
  typeof a === 'string' && typeof b === 'string'
    ? a.localeCompare(b)
    : Number(a) - Number(b)

/**
 * Rows sorted by one column. Unknown values always sit at the end, whichever way the sort
 * runs, so "not known" never reads as the biggest or smallest; ties fall back to the name.
 */
export const sortRows = (
  rows: readonly AuditRow[],
  { column, direction }: AuditSort
): AuditRow[] => {
  const sign = direction === 'ascending' ? 1 : -1
  return [...rows].sort((a, b) => {
    const [x, y] = [keyOf(a, column), keyOf(b, column)]
    if (x === null || y === null) {
      const unknown = Number(x === null) - Number(y === null)
      return unknown || a.name.localeCompare(b.name)
    }
    return sign * compareKeys(x, y) || a.name.localeCompare(b.name)
  })
}

/** The next sort when a column's header is pressed: a new column starts ascending, then flips. */
export const nextSort = (
  current: AuditSort | null,
  column: AuditColumn
): AuditSort =>
  current?.column === column && current.direction === 'ascending'
    ? { column, direction: 'descending' }
    : { column, direction: 'ascending' }

/** One page of rows and where it sits: first and last are 1-based, 0 and 0 when empty. */
export interface Page<T> {
  readonly rows: readonly T[]
  /** 1-based, and never beyond the last page */
  readonly page: number
  readonly pageCount: number
  readonly first: number
  readonly last: number
  readonly total: number
}

export const pageOf = <T>(
  rows: readonly T[],
  page: number,
  size: number
): Page<T> => {
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(Math.max(1, page), pageCount)
  const start = (current - 1) * size
  const slice = rows.slice(start, start + size)
  return {
    rows: slice,
    page: current,
    pageCount,
    first: slice.length === 0 ? 0 : start + 1,
    last: start + slice.length,
    total: rows.length
  }
}
