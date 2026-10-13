import encode from '../encode'

describe('encode', () => {
  it('returns default when no params', () => {
    expect(encode({})).toBe('q=yum')
  })

  it('encodes search query', () => {
    expect(encode({ q: 'chicken' })).toBe('q=chicken')
  })

  it('skips an empty query', () => {
    expect(encode({ q: '' })).toBe('')
  })

  it('encodes every filter list', () => {
    expect(
      encode({
        diet: ['high-protein'],
        health: ['vegan'],
        mealType: ['Dinner'],
        dishType: ['Soup'],
        cuisineType: ['Italian']
      })
    ).toBe(
      'diet=high-protein&health=vegan&mealType=Dinner&dishType=Soup&cuisineType=Italian'
    )
  })
})
