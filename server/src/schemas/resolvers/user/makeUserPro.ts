import { requireUser } from '../../../utils/requireUser'
import type { Tier } from '../../../utils/tiers'
import { MyContext } from '../../types'

export const makeUserPro = async (
  _parent: unknown,
  { tier }: { tier?: Tier | null },
  { dataSources, user }: MyContext
) => {
  const { _id } = requireUser(user)
  return dataSources.userApi.makeUserPro({ _id, tier: tier ?? null })
}
