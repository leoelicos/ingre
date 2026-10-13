import {
  buildRecipeFields,
  DEFAULT_PICTURE_URL,
  toSavedIngredient
} from './saveRecipe'

const input = {
  name: 'Soup',
  portions: 2,
  ingredients: [],
  picture_url: 'pic.png',
  libraryId: 'lib-1',
  instructions: 'Boil'
}

describe('buildRecipeFields', () => {
  it('copies fields and attaches ingredients', () => {
    expect(buildRecipeFields(input, ['a'])).toEqual({
      name: 'Soup',
      portions: 2,
      instructions: 'Boil',
      ingredients: ['a'],
      picture_url: 'pic.png',
      libraryId: 'lib-1'
    })
  })
  it('falls back to the default picture', () => {
    expect(
      buildRecipeFields({ ...input, picture_url: '' }, []).picture_url
    ).toBe(DEFAULT_PICTURE_URL)
  })
})

describe('toSavedIngredient', () => {
  it('drops non-public fields', () => {
    expect(
      toSavedIngredient({
        _id: 'id',
        name: 'egg',
        quantity: 1,
        measure: 'unit',
        category: 'c',
        __v: 0
      })
    ).toEqual({
      _id: 'id',
      name: 'egg',
      quantity: 1,
      measure: 'unit',
      category: 'c'
    })
  })
})
