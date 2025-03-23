import { CategoryApi } from 'datasources/category'
import { IngredientApi } from 'datasources/ingredient'
import { IngredientSchema } from 'models/Ingredient'
import { IngredientInput, RecipeInput, RecipePopulated } from 'schemas/types'
import { MyContext } from 'schemas/types'

export const createSaveIngredient = async ({
  ingredientInput,
  categoryApi,
  ingredientApi
}: {
  ingredientInput: IngredientInput
  categoryApi: CategoryApi
  ingredientApi: IngredientApi
}) => {
  try {
    const name = ingredientInput.name || 'Generic'
    const quantity = ingredientInput.quantity || 1
    const measure = ingredientInput.measure || 'unit'
    const category = ingredientInput.category || 'Generic'

    const foundCategory = await categoryApi.findOrCreateCategory({
      categoryName: category
    })
    if (foundCategory) {
      const response = await ingredientApi.createIngredient({
        name,
        quantity,
        measure,
        category: foundCategory._id
      })
      if (response) {
        return {
          _id: response._id,
          name: response.name,
          quantity: response.quantity,
          measure: response.measure,
          category: response.category
        }
      }
    }
  } catch (error) {
    throw error
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
}): Promise<IngredientSchema[]> => {
  const results = await Promise.allSettled(
    ingredients.map((ingredientInput) =>
      createSaveIngredient({
        ingredientInput,
        categoryApi,
        ingredientApi
      })
    )
  )

  return results
    .filter(
      (result): result is PromiseFulfilledResult<IngredientSchema> =>
        result.status === 'fulfilled'
    )
    .map((result) => result.value)
}

// saves a recipe to the database
export const saveRecipe = async (
  _: any,
  {
    input: { name, portions, ingredients, picture_url, edamamId, instructions }
  }: { input: RecipeInput },
  { user, dataSources }: MyContext
): Promise<RecipePopulated | undefined> => {
  try {
    if (!user) throw new Error('Not logged in!')

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
      picture_url:
        picture_url ||
        'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc',
      edamamId
    })
    if (recipe) {
      await dataSources.userApi.addRecipeToUser({
        userId: user._id,
        recipeId: recipe._id
      })
      return {
        _id: recipe._id,
        name: recipe.name,
        portions: recipe.portions,
        instructions: recipe.instructions,
        ingredients: recipe.ingredients.map((i) => ({
          _id: i._id,
          category: i.category,
          measure: i.measure,
          name: i.name,
          quantity: i.quantity
        })),
        picture_url: recipe.picture_url,
        edamamId: recipe.edamamId
      }
    }
  } catch (error) {
    throw error
  }
}
