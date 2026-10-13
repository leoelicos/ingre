import { readFileSync } from 'fs'
import { join } from 'path'
import { parse, validate } from 'graphql'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from './typeDefs'

/** Contract test: every gql document in the client must validate against this schema. */
const clientGraphQLDir = join(
  __dirname,
  '../../../client/src/lib/apollo/graphQL'
)
const files = [
  'queries.ts',
  'mutations.ts',
  'useSaveRecipe.ts',
  'updateRecipe.ts'
]

const operations = files.flatMap((file) =>
  Array.from(
    readFileSync(join(clientGraphQLDir, file), 'utf8').matchAll(
      /gql`([^`]*)`/g
    ),
    (match) => ({ file, source: match[1] ?? '' })
  )
)

describe('client GraphQL operations', () => {
  const schema = makeExecutableSchema({ typeDefs })

  it('finds the client operations', () => {
    expect(operations.length).toBeGreaterThanOrEqual(10)
  })

  it.each(
    operations.map(({ file, source }) => [
      file,
      source.trim().split('\n')[0],
      source
    ])
  )('%s: %s validates', (_file, _name, source) => {
    expect(validate(schema, parse(source)).map((e) => e.message)).toEqual([])
  })
})
