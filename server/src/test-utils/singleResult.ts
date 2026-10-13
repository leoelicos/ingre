/* Type-safe reader for ApolloServer.executeOperation results in tests (no casts). */
export interface GraphQLErrorJSON {
  message: string
  [key: string]: unknown
}

export interface SingleResult {
  errors?: GraphQLErrorJSON[]
  data?: Record<string, unknown> | null
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isErrorJSON = (value: unknown): value is GraphQLErrorJSON =>
  isRecord(value) && typeof value['message'] === 'string'

export function singleResult(response: { body: unknown }): SingleResult {
  // round-trip through JSON so ObjectIds etc. compare as plain values
  const parsed: unknown = JSON.parse(JSON.stringify(response.body))
  if (!isRecord(parsed) || !isRecord(parsed['singleResult'])) {
    throw new Error('expected a single GraphQL result')
  }
  const { errors, data } = parsed['singleResult']
  const result: SingleResult = {}
  if (errors !== undefined) {
    if (!Array.isArray(errors) || !errors.every(isErrorJSON)) {
      throw new Error('malformed GraphQL errors')
    }
    result.errors = errors
  }
  if (data !== undefined) {
    if (data !== null && !isRecord(data)) {
      throw new Error('malformed GraphQL data')
    }
    result.data = data
  }
  return result
}

/** Copy of a test context without the authenticated user. */
export const withoutUser = <T extends { user?: unknown }>(
  context: T
): Omit<T, 'user'> => {
  const { user: _user, ...rest } = context
  return rest
}
