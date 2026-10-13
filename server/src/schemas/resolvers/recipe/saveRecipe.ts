import { CategoryApi } from '../../../datasources/category'
import { IngredientApi } from '../../../datasources/ingredient'
import {
  fulfilledValues,
  withIngredientDefaults
} from '../../../utils/ingredientDefaults'
import { requireUser } from '../../../utils/requireUser'
import {
  IngredientInput,
  MyContext,
  RecipeInput,
  RecipePopulated
} from '../../types'
import { toRecipePopulated } from './toRecipePopulated'

export const DEFAULT_PICTURE_URL =
  'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'

type IngredientApis = { categoryApi: CategoryApi; ingredientApi: IngredientApi }

/** Picks the public fields of a created ingredient. */
export const toSavedIngredient = <
  T extends {
    _id: unknown
    name: string
    quantity: number
    measure: string
    category: unknown
  }
>({
  _id,
  name,
  quantity,
  measure,
  category
}: T): Pick<T, '_id' | 'name' | 'quantity' | 'measure' | 'category'> => ({
  _id,
  name,
  quantity,
  measure,
  category
})

/** Builds the recipe document fields, applying the default picture. */
export const buildRecipeFields = <I>(
  { name, portions, picture_url, libraryId, instructions }: RecipeInput,
  ingredients: I[]
) => ({
  name,
  portions,
  instructions,
  ingredients,
  picture_url: picture_url || DEFAULT_PICTURE_URL,
  libraryId
})

export const createSaveIngredient = async ({
  ingredientInput,
  categoryApi,
  ingredientApi
}: IngredientApis & { ingredientInput: IngredientInput }) => {
  const { category, ...fields } = withIngredientDefaults(ingredientInput)
  const foundCategory = await categoryApi.findOrCreateCategory({
    categoryName: category
  })
  const created = await ingredientApi.createIngredient({
    ...fields,
    category: foundCategory._id
  })
  return toSavedIngredient(created)
}

export const createSaveIngredients = async ({
  ingredients,
  ...apis
}: IngredientApis & { ingredients: Array<IngredientInput> }) =>
  fulfilledValues(
    await Promise.allSettled(
      ingredients.map((ingredientInput) =>
        createSaveIngredient({ ingredientInput, ...apis })
      )
    )
  )

// saves a recipe to the database
export const saveRecipe = async (
  _: unknown,
  { input }: { input: RecipeInput },
  { user, dataSources }: MyContext
): Promise<RecipePopulated> => {
  const { _id: userId } = requireUser(user)
  const { categoryApi, ingredientApi, recipeApi, userApi } = dataSources
  const ingredients = await createSaveIngredients({
    ingredients: input.ingredients,
    categoryApi,
    ingredientApi
  })
  const recipe = await recipeApi.createRecipe(
    buildRecipeFields(input, ingredients)
  )
  await userApi.addRecipeToUser({ userId, recipeId: recipe._id })
  return toRecipePopulated(recipe)
}
