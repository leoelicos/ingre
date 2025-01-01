import { signToken } from 'utils/auth'
import { UserInput } from 'schemas/types'
import { MyContext } from 'schemas/types'

export const addUser = async (
  _parent: unknown,
  { input }: { input: UserInput },
  { dataSources }: MyContext
) => {
  try {
    const { email, password, firstName, lastName } = input
    const existingUser = await dataSources.userApi.findOneUser({ email })
    if (existingUser) throw new Error('Email already in use')
    const user = await dataSources.userApi.createUser({
      email,
      password,
      firstName,
      lastName
    })
    if (!user) throw new Error('could not create user')
    const token = signToken(user)
    return { token, user }
  } catch (error) {
    throw error
  }
}
