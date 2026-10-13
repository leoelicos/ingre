import { CategoryApi } from '../../../datasources/category'
import { IngredientApi } from '../../../datasources/ingredient'
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

export const createSaveIngredient = async ({
  ingredientInput,
  categoryApi,
  ingredientApi
}: {
  ingredientInput: IngredientInput
  categoryApi: CategoryApi
  ingredientApi: IngredientApi
}) => {
  const name = ingredientInput.name || 'Generic'
  const quantity = ingredientInput.quantity || 1
  const measure = ingredientInput.measure || 'unit'
  const category = ingredientInput.category || 'Generic'

  const foundCategory = await categoryApi.findOrCreateCategory({
    categoryName: category
  })
  const response = await ingredientApi.createIngredient({
    name,
    quantity,
    measure,
    category: foundCategory._id
  })
  return {
    _id: response._id,
    name: response.name,
    quantity: response.quantity,
    measure: response.measure,
    category: response.category
  }
}

export const createSaveIngredients = async ({
  ingredients,
  categoryApi,
  ingredientApi
}: {
  ingredients: Array<IngredientInput>
  categoryApi: CategoryApi
  ingredientApi: IngredientApi
}) => {
  const results = await Promise.allSettled(
    ingredients.map((ingredientInput) =>
      createSaveIngredient({
        ingredientInput,
        categoryApi,
        ingredientApi
      })
    )
  )

  return results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : []
  )
}

// saves a recipe to the database
export const saveRecipe = async (
  _: unknown,
  {
    input: { name, portions, ingredients, picture_url, libraryId, instructions }
  }: { input: RecipeInput },
  { user, dataSources }: MyContext
): Promise<RecipePopulated> => {
  const { _id: userId } = requireUser(user)

  const createdIngredients = await createSaveIngredients({
    ingredients,
    categoryApi: dataSources.categoryApi,
    ingredientApi: dataSources.ingredientApi
  })

  const recipe = await dataSources.recipeApi.createRecipe({
    name,
    portions,
    instructions,
    ingredients: createdIngredients,
    picture_url: picture_url || DEFAULT_PICTURE_URL,
    libraryId
  })
  await dataSources.userApi.addRecipeToUser({ userId, recipeId: recipe._id })
  return toRecipePopulated(recipe)
}
