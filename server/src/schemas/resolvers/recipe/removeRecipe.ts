import { Types } from 'mongoose'
import { requireUser } from '../../../utils/requireUser'
import { MyContext } from '../../types'

export const removeRecipe = async (
  _: unknown,
  { recipeId }: { recipeId: Types.ObjectId },
  { user, dataSources }: MyContext
): Promise<boolean> => {
  const { _id } = requireUser(user)
  await dataSources.recipeApi.deleteRecipe({ recipeId })
  await dataSources.userApi.removeRecipeFromUser({ userId: _id, recipeId })
  return true
}
