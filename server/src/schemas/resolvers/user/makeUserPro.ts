import { requireUser } from '../../../utils/requireUser'
import { MyContext } from '../../types'

export const makeUserPro = async (
  _parent: unknown,
  _args: unknown,
  { dataSources, user }: MyContext
) => {
  const { _id } = requireUser(user)
  return dataSources.userApi.makeUserPro({ _id })
}
