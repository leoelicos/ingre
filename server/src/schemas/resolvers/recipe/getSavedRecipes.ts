import mongoose from 'mongoose'
import { RecipeSchema } from '../../../models/Recipe'
import { MyContext } from '../../types'

export const getSavedRecipes = async (
  _parent: unknown,
  _args: unknown,
  { dataSources, user }: MyContext
): Promise<
  Array<mongoose.Types.Subdocument<unknown> & RecipeSchema> | undefined
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
