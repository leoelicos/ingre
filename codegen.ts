import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'server/src/schemas/typeDefs.ts',
  documents: ['client/src/**/*.{ts,tsx}'],
  generates: {
    'server/src/schemas/generated/graphql.ts': {
      plugins: ['typescript'],
      config: {
        skipTypename: true,
        enumsAsTypes: true,
        avoidOptionals: false
      }
    }
  },
  ignoreNoDocuments: true
}

export default config
