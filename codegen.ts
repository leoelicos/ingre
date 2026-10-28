import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'server/schema.graphql',
  documents: ['client/src/**/*.{ts,tsx}'],
  generates: {
    'client/src/lib/apollo/graphQL/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
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
