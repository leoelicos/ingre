import { Types } from 'mongoose'
import { NotFoundError } from '../../../errors'
import { requireUser } from '../../../utils/requireUser'
import { MyContext, RecipePopulated } from '../../types'
import { toRecipePopulated } from './toRecipePopulated'

export const getRecipe = async (
  _parent: unknown,
  { _id }: { _id: Types.ObjectId },
  { dataSources, user }: MyContext
): Promise<RecipePopulated> => {
  requireUser(user)
  const recipe = await dataSources.recipeApi.getRecipe(_id)
  if (!recipe) throw new NotFoundError('could not find recipe')
  return toRecipePopulated(recipe)
}
