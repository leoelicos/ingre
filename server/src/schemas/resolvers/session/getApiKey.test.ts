import { getApiKey } from './getApiKey'

describe('getApiKey', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })
  afterEach(() => {
    process.env = ORIGINAL_ENV
  })
  it('should return HEROKU_EDAMAM credentials when set', async () => {
    process.env.HEROKU_EDAMAM_APP_ID = 'mockAppId'
    process.env.HEROKU_EDAMAM_APP_KEY = 'mockAppKey'
    process.env.PRODUCTION_EDAMAM_APP_ID = 'mockAppId2'
    process.env.PRODUCTION_EDAMAM_APP_KEY = 'mockAppKey2'
    const credentials = await getApiKey()
    expect(credentials).toEqual({
      appId: 'mockAppId',
      appKey: 'mockAppKey'
    })
  })
  it('should return PRODUCTION_EDAMAM credentials when set an error when HEROKU_EDAMAM credentials are missing', async () => {
    process.env.HEROKU_EDAMAM_APP_ID = undefined
    process.env.HEROKU_EDAMAM_APP_KEY = undefined
    process.env.PRODUCTION_EDAMAM_APP_ID = 'mockAppId2'
    process.env.PRODUCTION_EDAMAM_APP_KEY = 'mockAppKey2'
    const credentials = await getApiKey()
    expect(credentials).toEqual({
      appId: 'mockAppId2',
      appKey: 'mockAppKey2'
    })
  })
  it('should throw if no credentials are found', async () => {
    process.env.HEROKU_EDAMAM_APP_ID = undefined
    process.env.HEROKU_EDAMAM_APP_KEY = undefined
    process.env.PRODUCTION_EDAMAM_APP_ID = undefined
    process.env.PRODUCTION_EDAMAM_APP_KEY = undefined
    await expect(getApiKey()).rejects.toThrow('credentials not found')
  })
})
