import { NotFoundError } from '../../../errors'
import { requireUser } from '../../../utils/requireUser'
import { MyContext } from '../../types'

export const getNumSavedRecipes = async (
  _parent: unknown,
  _args: unknown,
  { dataSources, user }: MyContext
): Promise<number> => {
  const { _id } = requireUser(user)
  const foundUser = await dataSources.userApi.findOneUserById({ id: _id })
  if (!foundUser) throw new NotFoundError('Could not find user')
  return foundUser['numSavedRecipes']
}
