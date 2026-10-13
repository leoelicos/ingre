import { Types } from 'mongoose'
import { MyContext } from '../../types'

export const removeRecipe = async (
  _: unknown,
  { recipeId }: { recipeId: Types.ObjectId },
  { user, dataSources }: MyContext
) => {
  try {
    if (!user) throw new Error('Not logged in!')
    await dataSources.recipeApi.deleteRecipe({ recipeId })
    await dataSources.userApi.removeRecipeFromUser({
      userId: user._id,
      recipeId
    })
  } catch (error) {
    throw error
  }
}
