import { createDataSources } from './datasources'
import { getJwtSecret, readUserFromAuthHeader } from './utils/auth'
import type { MyContext } from './schemas/types'

type RequestHeaders = {
  authorization?: string | undefined
  referer?: string | undefined
}

/** Builds the per-request GraphQL context from HTTP headers. */
export const buildContext = (
  headers: RequestHeaders,
  dataSources: MyContext['dataSources'] = createDataSources()
): MyContext => {
  const secret = getJwtSecret()
  const user = secret
    ? readUserFromAuthHeader(headers.authorization, secret)
    : null
  return {
    dataSources,
    ...(user ? { user } : {}),
    ...(headers.referer ? { headers: { referer: headers.referer } } : {})
  }
}
