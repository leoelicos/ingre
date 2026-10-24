/* Shared wording for the recipe rows and Explore. */
import { formatRecipeCount, translate } from '../../i18n'

/** The Saved switch is on but nothing has a heart yet (#160, reworded for #179; Explore's filter since #181). */
export const NO_SAVED_HINT = translate('saved.empty')

/** "1 recipe", "3 recipes" */
export const recipeCount = (n: number): string => formatRecipeCount(n)
