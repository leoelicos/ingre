import { ConflictError } from '../../../errors'
import { signToken } from '../../../utils/auth'
import { MyContext, UserInput } from '../../types'

export const addUser = async (
  _parent: unknown,
  { input }: { input: UserInput },
  { dataSources }: MyContext
) => {
  const { email, password, firstName, lastName } = input
  const existingUser = await dataSources.userApi.findOneUser({ email })
  if (existingUser) throw new ConflictError('Email already in use')
  const user = await dataSources.userApi.createUser({
    email,
    password,
    firstName,
    lastName
  })
  return { token: signToken(user), user }
}
