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
  /** FSANZ mandatory allergens, e.g. 'milk', 'tree nut (almond)'; empty when none */
  allergens: string[]
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
  /** many-to-many: cuisines, diets, meals */
  tags: string[]
  ingredients: LibraryRecipeIngredient[]
  method: string[]
  picture_url?: string
}

export interface LibrarySearch {
  q?: string
  tags?: string[]
}
