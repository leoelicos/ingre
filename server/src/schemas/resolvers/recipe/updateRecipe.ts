import mongoose from 'mongoose'
import { RecipeSchema } from '../../../models/Recipe'
import { RecipeInput } from '../../types'
import { MyContext } from '../../types'

export const updateRecipe = async (
  _parent: unknown,
  {
    recipeId,
    input
  }: { recipeId: mongoose.Types.ObjectId; input: RecipeInput },
  { user, dataSources }: MyContext
): Promise<RecipeSchema | undefined> => {
  try {
    if (!user) throw new Error('Not logged in!')
    return await dataSources.recipeApi.updateRecipe({
      recipeId,
      input
    })
  } catch (error) {
    throw error
  }
}
