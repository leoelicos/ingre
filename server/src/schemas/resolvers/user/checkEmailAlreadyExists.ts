import { MyContext } from 'schemas/types'

export const checkEmailAlreadyExists = async (
  _parent: any,
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
