import { MyContext } from '../../types'

export const checkEmailAlreadyExists = async (
  _parent: unknown,
  { email }: { email: string },
  { dataSources }: MyContext
): Promise<boolean> => {
  const user = await dataSources.userApi.findOneUser({ email })
  return user !== null
}
