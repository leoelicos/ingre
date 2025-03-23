import { MyContext } from 'schemas/types'

export const getUser = async (
  _: any,
  __: any,
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
