/* Shared wording for the recipe rows and Explore. */

/** The Saved switch is on but nothing has a heart yet (#160, reworded for #179; Explore's filter since #181). */
export const NO_SAVED_HINT =
  'No saved recipes yet. Sign in, open a recipe with its arrow, then tap its heart to save it. It will show here.'

/** "1 recipe", "3 recipes" */
export const recipeCount = (n: number): string =>
  `${n} ${n === 1 ? 'recipe' : 'recipes'}`
