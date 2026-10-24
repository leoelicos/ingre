import type { MockedResponse } from '@apollo/client/testing'
import { REMOVE_RECIPE, SAVE_RECIPE } from '../lib/apollo/graphQL/mutations'
import { GET_SAVED_RECIPES } from '../lib/apollo/graphQL/queries'
import type { SavedRecipe } from '../lib/apollo/graphQL/typedefs'
import type { RecipeInput } from '../types/payloads'

/* Server hearts for tests (#182, F4): MockedProvider responses with __typename, no jest.mock. */

export const savedRecipe = (
  libraryId: string,
  _id = `saved-${libraryId}`
): SavedRecipe & { __typename: 'Recipe' } => ({
  __typename: 'Recipe',
  _id,
  name: libraryId,
  portions: 2,
  ingredients: [],
  picture_url: '/ingre.png',
  libraryId,
  instructions: null,
  customisations: []
})

export const savedQuery = (
  recipes: readonly SavedRecipe[] = []
): MockedResponse => ({
  request: { query: GET_SAVED_RECIPES },
  result: { data: { getSavedRecipes: recipes } }
})

/** saveRecipe answering any input with a saved copy of `libraryId`; `seen` collects inputs. */
export const saveMock = (
  libraryId: string,
  seen: RecipeInput[] = []
): MockedResponse => ({
  request: { query: SAVE_RECIPE },
  variableMatcher: (variables: Record<string, unknown>) => {
    const input = variables['input']
    if (isInput(input)) seen.push(input)
    return isInput(input) && input.libraryId === libraryId
  },
  result: { data: { saveRecipe: savedRecipe(libraryId) } }
})

export const saveFails = (): MockedResponse => ({
  request: { query: SAVE_RECIPE },
  variableMatcher: () => true,
  error: new Error('offline')
})

export const removeMock = (recipeId: string, fail = false): MockedResponse =>
  fail
    ? {
        request: { query: REMOVE_RECIPE, variables: { recipeId } },
        error: new Error('offline')
      }
    : {
        request: { query: REMOVE_RECIPE, variables: { recipeId } },
        result: { data: { removeRecipe: true } }
      }

const isInput = (value: unknown): value is RecipeInput =>
  typeof value === 'object' && value !== null && 'libraryId' in value
