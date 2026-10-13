import { toRecipeUpdate, usedCategoryIds } from './recipe'

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

describe('toRecipeUpdate', () => {
  it('maps input fields and replaces ingredients with ids', () => {
    expect(
      toRecipeUpdate(
        {
          name: 'n',
          portions: 3,
          ingredients: [
            { name: 'x', quantity: 1, measure: 'u', category: 'c' }
          ],
          picture_url: 'p',
          libraryId: null,
          instructions: 'i'
        },
        [1, 2]
      )
    ).toEqual({
      name: 'n',
      portions: 3,
      ingredients: [1, 2],
      picture_url: 'p',
      libraryId: null,
      instructions: 'i'
    })
  })
})
