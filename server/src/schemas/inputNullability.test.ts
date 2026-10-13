import { ApolloServer } from '@apollo/server'
import { gql } from 'graphql-tag'
import { typeDefs } from './typeDefs'
import { resolvers } from './resolvers'

const SAVE = gql`
  mutation SaveRecipe($input: RecipeInput!) {
    saveRecipe(input: $input) {
      _id
    }
  }
`

describe('RecipeInput nullability', () => {
  const server = new ApolloServer({ typeDefs, resolvers })

  it.each([
    ['name', { portions: 1, ingredients: [], picture_url: 'p' }],
    [
      'ingredient measure',
      {
        name: 'n',
        portions: 1,
        picture_url: 'p',
        ingredients: [{ name: 'x', quantity: 1, category: 'c' }]
      }
    ]
  ])(
    'rejects input missing %s before any resolver runs',
    async (_label, input) => {
      const res = await server.executeOperation({
        query: SAVE,
        variables: { input }
      })
      expect(res.body.kind).toBe('single')
      if (res.body.kind !== 'single') return
      expect(res.body.singleResult.errors?.[0]?.extensions?.['code']).toBe(
        'BAD_USER_INPUT'
      )
    }
  )
})
