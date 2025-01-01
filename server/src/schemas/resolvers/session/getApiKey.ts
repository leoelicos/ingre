//! security issue - graphql passing to UI frontend
import dotenv from 'dotenv'
import { resolve } from 'path'
import { EdamamCredentials } from 'schemas/types'

dotenv.config({ path: resolve(__dirname, '../../../../.env') })

export const getApiKey = async (): Promise<EdamamCredentials> => {
  const APP_KEY =
    process.env.HEROKU_EDAMAM_APP_KEY || process.env.PRODUCTION_EDAMAM_APP_KEY
  const APP_ID =
    process.env.HEROKU_EDAMAM_APP_ID || process.env.PRODUCTION_EDAMAM_APP_ID
  if (APP_ID && APP_KEY) {
    return { appId: APP_ID, appKey: APP_KEY }
  } else {
    throw new Error('credentials not found')
  }
}
