import { MyContext } from '../../types'

export const checkEmailAlreadyExists = async (
  _parent: unknown,
  { email }: { email: string },
  { dataSources }: MyContext
) => {
  try {
    const user = await dataSources.userApi.findOneUser({ email })
    if (!user) return false
    return true
  } catch (error) {
    throw error
  }
}
