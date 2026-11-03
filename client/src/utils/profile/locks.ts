/* Hard locks (#224): allergens and diets. A locked recipe is never shown, whatever the profile says. */
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { allergensOf } from '../library/allergens'
import type { IngredientClass } from './classes'
import { classOf } from './classes'

export type Diet = 'none' | 'pescatarian' | 'vegetarian' | 'vegan'
export const DIETS: readonly Diet[] = [
  'none',
  'pescatarian',
  'vegetarian',
  'vegan'
]

export interface Locks {
  /** FSANZ allergen names, or a family such as "gluten" or "tree nut" */
  readonly allergens: readonly string[]
  readonly diet: Diet
}

export const NO_LOCKS: Locks = { allergens: [], diet: 'none' }

const MEAT: readonly IngredientClass[] = [
  'beef',
  'pork',
  'poultry',
  'processed-meat'
]
const VEGETARIAN: readonly IngredientClass[] = [...MEAT, 'seafood']
const DIET_CLASSES: Readonly<Record<Diet, readonly IngredientClass[]>> = {
  none: [],
  pescatarian: MEAT,
  vegetarian: VEGETARIAN,
  vegan: [...VEGETARIAN, 'egg', 'milk-and-cream', 'cheese', 'yoghurt']
}
/** Items a diet rules out although their class does not say so. */
const SEAFOOD_SAUCES = ['fish-sauce', 'oyster-sauce']
const DIET_ITEMS: Readonly<Record<Diet, readonly string[]>> = {
  none: [],
  pescatarian: [],
  vegetarian: SEAFOOD_SAUCES,
  vegan: [...SEAFOOD_SAUCES, 'honey']
}

/** A tag is locked by its own name or by its family: "gluten" locks "gluten (oats)". */
export const allergenLocked = (tag: string, lock: string): boolean => {
  const name = tag.toLowerCase()
  const locked = lock.toLowerCase()
  return name === locked || name.startsWith(`${locked} (`)
}

const dietLocks = (ingredientId: string, diet: Diet): boolean =>
  DIET_CLASSES[diet].includes(classOf(ingredientId)) ||
  DIET_ITEMS[diet].includes(ingredientId)

export const itemLocked = (
  ingredientId: string,
  items: readonly LibraryIngredient[],
  locks: Locks
): boolean =>
  dietLocks(ingredientId, locks.diet) ||
  allergensOf(ingredientId, items).some((tag) =>
    locks.allergens.some((lock) => allergenLocked(tag, lock))
  )

export const recipeLocked = (
  recipe: LibraryRecipe,
  items: readonly LibraryIngredient[],
  locks: Locks
): boolean =>
  recipe.ingredients.some((line) => itemLocked(line.ingredientId, items, locks))

/** The recipes no lock rules out. */
export const unlockedRecipes = (
  recipes: readonly LibraryRecipe[],
  items: readonly LibraryIngredient[],
  locks: Locks
): LibraryRecipe[] =>
  recipes.filter((recipe) => !recipeLocked(recipe, items, locks))
