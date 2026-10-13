import { NotFoundError } from '../../../errors'
import { requireUser } from '../../../utils/requireUser'
import { MyContext } from '../../types'

export const getUser = async (
  _: unknown,
  __: unknown,
  { dataSources, user: contextUser }: MyContext
) => {
  const { _id } = requireUser(contextUser)
  const user = await dataSources.userApi.findOneUserById({ id: _id })
  if (!user) throw new NotFoundError('Could not find user')
  return user
}
