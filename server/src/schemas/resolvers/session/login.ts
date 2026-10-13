import { AuthenticationError } from '../../../errors'
import { signToken } from '../../../utils/auth'
import { MyContext } from '../../types'

export const login = async (
  _parent: unknown,
  { email, password }: { email: string; password: string },
  { dataSources }: MyContext
) => {
  const user = await dataSources.userApi.checkUserPassword({ email, password })
  if (!user) throw new AuthenticationError('Incorrect credentials')
  return { token: signToken(user), user }
}
