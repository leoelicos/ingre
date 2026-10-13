import { MyContext } from '../../types'

export const getNumSavedRecipes = async (
  _parent: unknown,
  _args: unknown,
  { dataSources, user }: MyContext
): Promise<number> => {
  try {
    if (!user) throw new Error('Not logged in!')
    const foundUser = await dataSources.userApi.findOneUserById({
      id: user._id
    })
    if (!foundUser) throw new Error('Could not find user')
    return foundUser.numSavedRecipes
  } catch (error) {
    throw error
  }
}
