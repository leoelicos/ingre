import { toClientIngredient, toClientRecipe } from '../toClientRecipe'

const ingredient = {
  _id: 'i1',
  name: 'egg',
  quantity: 2,
  measure: 'whole',
  category: { _id: 'c1', name: 'dairy' }
}
const recipe = {
  _id: 'r1',
  name: 'Omelette',
  portions: 1,
  picture_url: 'p.png',
  ingredients: [ingredient],
  libraryId: 'lib',
  instructions: 'https://x'
}

describe('toClientIngredient', () => {
  it('flattens the category to its name', () => {
    expect(toClientIngredient(ingredient)).toEqual({
      _id: 'i1',
      name: 'egg',
      quantity: 2,
      measure: 'whole',
      category: 'dairy'
    })
  })
})

describe('toClientRecipe', () => {
  it('keeps present optional fields', () => {
    expect(toClientRecipe(recipe)).toEqual({
      ...recipe,
      ingredients: [toClientIngredient(ingredient)],
      tags: []
    })
  })
  it('omits null libraryId and null/empty instructions', () => {
    const nulls = toClientRecipe({
      ...recipe,
      libraryId: null,
      instructions: null
    })
    expect(nulls).not.toHaveProperty('libraryId')
    expect(nulls).not.toHaveProperty('instructions')
    expect(toClientRecipe({ ...recipe, instructions: '' })).not.toHaveProperty(
      'instructions'
    )
  })
  it('keeps an empty-string libraryId', () => {
    expect(toClientRecipe({ ...recipe, libraryId: '' }).libraryId).toBe('')
  })
})
