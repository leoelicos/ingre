import { signToken } from 'utils/auth'
import { MyContext } from 'schemas/types'

export const login = async (
  _parent: unknown,
  { email, password }: { email: string; password: string },
  { dataSources }: MyContext
) => {
  try {
    const user = await dataSources.userApi.checkUserPassword({
      email,
      password
    })
    if (!user) throw new Error('Incorrect credentials')
    return { token: signToken(user), user }
  } catch (e) {
    throw e
  }
}
