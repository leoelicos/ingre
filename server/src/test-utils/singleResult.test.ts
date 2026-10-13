import { isRecord, singleResult } from './singleResult'

describe('singleResult', () => {
  it('reads data and errors from a single result', () => {
    expect(
      singleResult({
        body: {
          kind: 'single',
          singleResult: { data: { a: 1 }, errors: [{ message: 'x' }] }
        }
      })
    ).toEqual({ data: { a: 1 }, errors: [{ message: 'x' }] })
    expect(singleResult({ body: { singleResult: { data: null } } })).toEqual({
      data: null
    })
    expect(singleResult({ body: { singleResult: {} } })).toEqual({})
  })

  it('rejects malformed bodies', () => {
    expect(() => singleResult({ body: null })).toThrow('single')
    expect(() => singleResult({ body: { singleResult: [] } })).toThrow('single')
    expect(() =>
      singleResult({ body: { singleResult: { errors: 'x' } } })
    ).toThrow('errors')
    expect(() =>
      singleResult({ body: { singleResult: { errors: [{}] } } })
    ).toThrow('errors')
    expect(() =>
      singleResult({ body: { singleResult: { data: 'x' } } })
    ).toThrow('data')
  })

  it('isRecord narrows plain objects only', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord([])).toBe(false)
    expect(isRecord(null)).toBe(false)
  })
})
