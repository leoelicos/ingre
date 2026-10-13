import encode from '../encode'

describe('encode', () => {
  it('returns default when no params', () => {
    expect(encode({})).toBe('q=yum')
  })

  it('encodes search query', () => {
    expect(encode({ q: 'chicken' })).toBe('q=chicken')
  })

  it('encodes diet filter', () => {
    expect(encode({ diet: ['high-protein'] })).toContain('diet=high-protein')
  })
})
