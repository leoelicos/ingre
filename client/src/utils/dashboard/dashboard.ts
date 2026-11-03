/*
 * The dashboard (#232): macros, estimated cost and supermarket spread for everything on the list.
 * Pure functions from the chips; the data is indicative (data/nutrition.json, data/prices.json).
 */
import nutritionData from '../../data/nutrition.json'
import type { Chip } from '../chips/chips'
import { convert } from '../shopping/units'
import type { ShopSection } from '../shopping/sections'
import { SHOP_SECTIONS } from '../shopping/sections'
import { PRICES } from '../suggest/suggest'
import type { Prices } from '../suggest/suggest'

/** What a weighed item's price buys, in grams (data/prices.json). */
export const WEIGHED_PRICE_GRAMS = 500

/** Nutrition of an amount: energy in kilojoules, the rest in grams. */
export interface Macros {
  readonly kj: number
  readonly protein: number
  readonly fat: number
  readonly carbs: number
}

export const NO_MACROS: Macros = { kj: 0, protein: 0, fat: 0, carbs: 0 }

/** Nutrition per 100 g, by ingredient id. */
export type Nutrition = ReadonlyMap<string, Macros>

type Rec = Record<string, unknown>
const isRecord = (v: unknown): v is Rec =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const failNutrition = (message: string): never => {
  throw new Error(`nutrition: ${message}`)
}

const figure = (v: unknown, where: string): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0
    ? v
    : failNutrition(`${where} needs a number of zero or more`)

const macrosOf = (v: unknown, id: string): Macros => {
  if (!isRecord(v)) return failNutrition(`${id} needs an object`)
  return {
    kj: figure(v['kj'], `${id}.kj`),
    protein: figure(v['protein'], `${id}.protein`),
    fat: figure(v['fat'], `${id}.fat`),
    carbs: figure(v['carbs'], `${id}.carbs`)
  }
}

/** Validates the bundled nutrition file, so a typo fails loudly and types need no casts. */
export const parseNutrition = (data: unknown): Nutrition => {
  if (!isRecord(data)) return failNutrition('expected an object')
  const table = data['per100g']
  if (!isRecord(table)) return failNutrition('expected a "per100g" object')
  return new Map(Object.entries(table).map(([id, v]) => [id, macrosOf(v, id)]))
}

export const NUTRITION: Nutrition = parseNutrition(nutritionData)

/** The chip's total in grams (ml counts as grams), or null when its weight is unknown. */
export const gramsOf = (chip: Chip): number | null =>
  chip.item === null ? null : convert(chip.total, 'g', chip.item)

/** Macros of an amount in grams, from a per-100 g row. */
export const scaled = (per100g: Macros, grams: number): Macros => ({
  kj: (per100g.kj * grams) / 100,
  protein: (per100g.protein * grams) / 100,
  fat: (per100g.fat * grams) / 100,
  carbs: (per100g.carbs * grams) / 100
})

export const addMacros = (a: Macros, b: Macros): Macros => ({
  kj: a.kj + b.kj,
  protein: a.protein + b.protein,
  fat: a.fat + b.fat,
  carbs: a.carbs + b.carbs
})

/**
 * How many of the priced pack the chip's total needs: whole packs of the smallest size, at least
 * one; a weighed item is priced per 500 g; one pack when the amount cannot be compared.
 */
export const packsOf = (chip: Chip): number => {
  const size = chip.item?.sold.find((option) => option.size !== null)?.size
  if (chip.item === null) return 1
  if (size === undefined || size === null) {
    const grams = gramsOf(chip)
    return grams === null ? 1 : grams / WEIGHED_PRICE_GRAMS
  }
  const need = convert(chip.total, size.unit, chip.item)
  return need === null ? 1 : Math.max(1, Math.ceil(need / size.amount - 1e-9))
}

const toCents = (dollars: number): number => Math.round(dollars * 100) / 100

/** Indicative dollars for the chip, or null when the item has no price. */
export const costOf = (chip: Chip, prices: Prices): number | null => {
  const price = prices.get(chip.id)
  return price === undefined ? null : toCents(price * packsOf(chip))
}

/** One item on the list, with what the dashboard can say about it. */
export interface DashboardLine {
  readonly id: string
  readonly name: string
  readonly section: ShopSection
  readonly macros: Macros | null
  readonly cost: number | null
}

export const lineOf = (
  chip: Chip,
  nutrition: Nutrition,
  prices: Prices
): DashboardLine => {
  const per100g = nutrition.get(chip.id)
  const grams = gramsOf(chip)
  return {
    id: chip.id,
    name: chip.name,
    section: chip.section,
    macros:
      per100g === undefined || grams === null ? null : scaled(per100g, grams),
    cost: costOf(chip, prices)
  }
}

/** A shop section's share of the cost. */
export interface SectionSpread {
  readonly section: ShopSection
  readonly items: number
  readonly cost: number
  /** whole percent of the priced total */
  readonly percent: number
}

export interface Dashboard {
  readonly items: number
  readonly macros: Macros
  readonly cost: number
  /** items whose weight is unknown or that have no nutrition row */
  readonly noMacros: readonly string[]
  /** items with no price */
  readonly noPrice: readonly string[]
  readonly spread: readonly SectionSpread[]
}

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0)

const spreadOf = (
  lines: readonly DashboardLine[],
  total: number
): SectionSpread[] =>
  SHOP_SECTIONS.map((section) => {
    const inSection = lines.filter((line) => line.section === section)
    const cost = toCents(sum(inSection.map((line) => line.cost ?? 0)))
    return {
      section,
      items: inSection.length,
      cost,
      percent: total === 0 ? 0 : Math.round((cost / total) * 100)
    }
  }).filter((entry) => entry.items > 0)

/** Greyed chips (removed from every recipe) are not on the list, so they are not counted. */
export const onList = (chips: readonly Chip[]): Chip[] =>
  chips.filter((chip) => !chip.greyed)

export const summarise = (
  chips: readonly Chip[],
  nutrition: Nutrition = NUTRITION,
  prices: Prices = PRICES
): Dashboard => {
  const lines = onList(chips).map((chip) => lineOf(chip, nutrition, prices))
  const cost = toCents(sum(lines.map((line) => line.cost ?? 0)))
  return {
    items: lines.length,
    macros: lines.reduce(
      (total, line) => addMacros(total, line.macros ?? NO_MACROS),
      NO_MACROS
    ),
    cost,
    noMacros: lines.filter((line) => line.macros === null).map((l) => l.name),
    noPrice: lines.filter((line) => line.cost === null).map((l) => l.name),
    spread: spreadOf(lines, cost)
  }
}
