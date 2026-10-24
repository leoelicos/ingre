/* Recipe allergens, derived from the catalogue at render time (never stored per recipe). */
import { translate } from '../../i18n'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'

/** Unique, lowercased, alphabetical allergens of a recipe's ingredients. */
export const recipeAllergens = (
  recipe: LibraryRecipe,
  ingredients: readonly LibraryIngredient[]
): string[] => {
  const ids = new Set(recipe.ingredients.map((ri) => ri.ingredientId))
  const all = ingredients
    .filter((i) => ids.has(i.id))
    .flatMap((i) => i.allergens.map((a) => a.toLowerCase()))
  return Array.from(new Set(all)).sort()
}

/** "Contains: milk, tree nut (almond)"; empty string when there are none. */
export const containsLine = (allergens: readonly string[]): string =>
  allergens.length === 0
    ? ''
    : translate('allergens.contains', {
        list: allergens.join(translate('allergens.separator'))
      })

/** An ingredient's allergen tags from the catalogue, by catalogue or extra id; none when unknown. */
export const allergensOf = (
  ingredientId: string,
  ingredients: readonly LibraryIngredient[]
): readonly string[] =>
  ingredients.find((item) => item.id === ingredientId)?.allergens ?? []

/** Unique, lowercased, alphabetical allergens of these items (#182: a customised recipe's). */
export const itemsAllergens = (
  items: readonly Pick<LibraryIngredient, 'allergens'>[]
): string[] =>
  Array.from(
    new Set(items.flatMap((i) => i.allergens.map((a) => a.toLowerCase())))
  ).sort()
