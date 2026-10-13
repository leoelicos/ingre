import { NotFoundError } from '../../../errors'
import { requireUser } from '../../../utils/requireUser'
import { MyContext } from '../../types'

export const getSavedRecipes = async (
  _parent: unknown,
  _args: unknown,
  { dataSources, user }: MyContext
) => {
  const { _id } = requireUser(user)
  const recipes = await dataSources.userApi.getUserSavedRecipes({ id: _id })
  if (!recipes) throw new NotFoundError('Could not find user')
  return recipes
}
