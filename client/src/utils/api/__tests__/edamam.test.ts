import fetchEdamam, { edamamTransport, recipesFromEdamamResponse } from '../edamam'
import { mockResponse } from '../mockResponse'

const search = { q: 'pasta' }

describe('recipesFromEdamamResponse', () => {
  it('deserializes a successful payload', () => {
    const recipes = recipesFromEdamamResponse({ status: 200, data: mockResponse })
    expect(recipes.length).toBeGreaterThan(0)
    expect(recipes[0].name.length).toBeGreaterThan(0)
  })

  it('rejects empty responses, error statuses, and missing payloads', () => {
    const info = jest.spyOn(console, 'info').mockImplementation(() => undefined)
    expect(() => recipesFromEdamamResponse(null)).toThrow('404')
    expect(() => recipesFromEdamamResponse({ status: 400, data: mockResponse })).toThrow('400')
    expect(() => recipesFromEdamamResponse({ status: 403, data: mockResponse })).toThrow('403')
    expect(() => recipesFromEdamamResponse({ status: 500, data: null })).toThrow('no data')
    expect(info).toHaveBeenCalledWith('Error: Unknown Edamam error', 500)
    expect(() => recipesFromEdamamResponse({ status: 200, data: {} })).toThrow('no hits')
    expect(() => recipesFromEdamamResponse({ status: 200 })).toThrow('no data')
    info.mockRestore()
  })

  it('still deserializes when the status is unknown but hits are present', () => {
    const info = jest.spyOn(console, 'info').mockImplementation(() => undefined)
    const recipes = recipesFromEdamamResponse({ status: 202, data: { hits: [] } })
    expect(recipes).toEqual([])
    expect(info).toHaveBeenCalled()
    info.mockRestore()
  })
})

describe('fetchEdamam', () => {
  const original = edamamTransport.request

  afterEach(() => {
    edamamTransport.request = original
  })

  it('requests edamam and returns recipes', async () => {
    const recipes = await fetchEdamam({ search, appId: 'id', appKey: 'key' })
    expect(recipes.length).toBeGreaterThan(0)
  })

  it('returns an empty list when the transport fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    edamamTransport.request = async () => {
      throw new Error('offline')
    }
    await expect(fetchEdamam({ search, appId: 'id', appKey: 'key' })).resolves.toEqual([])
    edamamTransport.request = async () => ({ status: 400, data: mockResponse })
    await expect(fetchEdamam({ search, appId: 'id', appKey: 'key' })).resolves.toEqual([])
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
