import { usedCategoryIds } from './recipe'

describe('usedCategoryIds', () => {
  it('returns distinct category ids across recipes', () => {
    const recipes = [
      { ingredients: [{ category: { _id: 'a' } }, { category: { _id: 'b' } }] },
      { ingredients: [{ category: { _id: 'a' } }] },
      { ingredients: [] }
    ]
    expect(usedCategoryIds(recipes)).toEqual(['a', 'b'])
  })
})
