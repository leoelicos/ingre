import type { Aisle } from '../utils/shopping/sections'

export type BaseUnit = 'g' | 'ml' | 'count'

export interface Amount {
  amount: number
  unit: BaseUnit
}

export type SoldType =
  | 'each'
  | 'bunch'
  | 'weighed'
  | 'pack'
  | 'bag'
  | 'tin'
  | 'jar'
  | 'bottle'
  | 'carton'
  | 'tube'
  | 'tub'
  | 'grinder'

/** One way a shop sells an item; `size` is null for loose, weighed items. */
export interface SoldOption {
  type: SoldType
  size: Amount | null
  /** e.g. "garlic bulb": reads "1 garlic bulb" */
  label?: string
  /** plural of label when it isn't label + "s" (e.g. "halves") */
  plural?: string
}

export type HomeLocation = 'Fridge' | 'Cupboard' | 'Spice rack' | 'Bench'

export interface LibraryIngredient {
  id: string
  name: string
  /** catalogue aisle id; mapped to a shop section in utils/shopping/sections */
  category: Aisle
  /** pantry staple most kitchens already have (salt, cooking oils) */
  staple?: boolean
  sold: SoldOption[]
  /** weight of one counted item (each/bunch) */
  approxGrams?: number
  /** grams per recipe-only measure, e.g. { clove: 6 } */
  measureGrams?: Record<string, number>
  /** default home location (user can override) */
  pantry: HomeLocation
  /** allergen tags from the FSANZ list (utils/library/fsanz), e.g. 'milk'; empty when none */
  allergens: string[]
  /** the buying unit of a counted item, spelled out (#182): { one: 'head', other: 'heads' } */
  countUnit?: CountUnit
  /** a part a recipe uses, shown when the total is not a whole count (#182): 'clove' */
  partMeasure?: string
}

/** A counted item's unit word, singular and plural. */
export interface CountUnit {
  one: string
  other: string
}

export interface LibraryRecipeIngredient {
  ingredientId: string
  quantity: number
  measure: string
}

export interface LibraryRecipe {
  id: string
  name: string
  portions: number
  ingredients: LibraryRecipeIngredient[]
  method: string[]
  picture_url?: string
}

export interface LibrarySearch {
  q?: string
}
