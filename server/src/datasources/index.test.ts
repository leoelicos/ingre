import { createDataSources } from '.'

describe('createDataSources', () => {
  it('creates data sources', () => {
    const { userApi } = createDataSources()
    expect(userApi.findOneUser).toBeDefined()
    expect(userApi.createUser).toBeDefined()
  })
})
