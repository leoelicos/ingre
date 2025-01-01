import mongoose from 'mongoose'
import { RecipeSchema } from 'models/Recipe'
import { MyContext } from 'schemas/types'

export const getSavedRecipes = async (
  _parent: any,
  _args: any,
  { dataSources, user }: MyContext
): Promise<
  Array<mongoose.Types.Subdocument<any> & RecipeSchema> | undefined
> => {
  try {
    if (!user) throw 'Not logged in!'
    return await dataSources.userApi.getUserSavedRecipes({
      id: user._id
    })
  } catch (e) {
    throw e
  }
}
