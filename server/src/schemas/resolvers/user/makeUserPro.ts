import { MyContext } from 'schemas/types'

export const makeUserPro = async (
  _parent: unknown,
  _args: unknown,
  { dataSources, user }: MyContext
) => {
  try {
    if (!user?._id) throw new Error('Not logged in!')
    return dataSources.userApi.makeUserPro({ _id: user._id })
  } catch (error) {
    throw error
  }
}
