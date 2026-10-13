import { MyContext } from '../../types'

export const getUser = async (
  _: unknown,
  __: unknown,
  { dataSources, user: contextUser }: MyContext
) => {
  try {
    if (!contextUser?._id) throw new Error('Not logged in!')
    const user = await dataSources.userApi.findOneUserById({
      id: contextUser._id
    })

    return user
  } catch (error) {
    throw error
  }
}
