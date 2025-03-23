import { Types } from 'mongoose'
import { MyContext } from 'schemas/types'

export const removeRecipe = async (
  _: any,
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
