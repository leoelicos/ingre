import { requireUser } from '../../../utils/requireUser'
import { MyContext } from '../../types'

export const removeRecipe = async (
  _: unknown,
  { recipeId }: { recipeId: string },
  { user, dataSources }: MyContext
): Promise<boolean> => {
  const { _id } = requireUser(user)
  // only a recipe the user saved; its saves go with it (saved_recipes cascades)
  await dataSources.recipeApi.deleteRecipe({ recipeId, userId: _id })
  return true
}
