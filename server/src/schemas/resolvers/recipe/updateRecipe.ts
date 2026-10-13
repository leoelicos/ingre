import mongoose from 'mongoose'
import { NotFoundError } from '../../../errors'
import { requireUser } from '../../../utils/requireUser'
import { MyContext, RecipeInput } from '../../types'

export const updateRecipe = async (
  _parent: unknown,
  {
    recipeId,
    input
  }: { recipeId: mongoose.Types.ObjectId; input: RecipeInput },
  { user, dataSources }: MyContext
) => {
  requireUser(user)
  const recipe = await dataSources.recipeApi.updateRecipe({ recipeId, input })
  if (!recipe) throw new NotFoundError('could not find recipe')
  return recipe
}
