import { Types } from 'mongoose'
import { MyContext, RecipePopulated } from 'schemas/types'

export const getRecipe = async (
  _parent: unknown,
  { _id }: { _id: Types.ObjectId },
  { dataSources, user }: MyContext
): Promise<RecipePopulated> => {
  try {
    if (!user) throw new Error('Not logged in!')
    const recipe = await dataSources.recipeApi.getRecipe(_id)
    if (!recipe) throw new Error('could not find recipe')
    return {
      _id: recipe._id,
      name: recipe.name,
      portions: recipe.portions,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients.map((i) => {
        return {
          _id: i._id,
          category: i.category,
          measure: i.measure,
          name: i.name,
          quantity: i.quantity
        }
      }),
      picture_url: recipe.picture_url,
      edamamId: recipe.edamamId
    }
  } catch (error) {
    throw error
  }
}
