import { isClientRecipe, isClientRecipeList } from '../guards'
import { recipe, ingredient, omit } from '../../../test/fixtures'

describe('recipe guards', () => {
  it('accepts a recipe and a list of recipes', () => {
    const value = recipe()
    expect(isClientRecipe(value)).toBe(true)
    expect(isClientRecipeList([value])).toBe(true)
    expect(isClientRecipeList([])).toBe(true)
  })

  it('rejects non-records and incomplete recipes', () => {
    expect(isClientRecipe(null)).toBe(false)
    expect(isClientRecipe('pasta')).toBe(false)
    expect(isClientRecipe({ ...recipe(), name: 1 })).toBe(false)
    expect(isClientRecipe({ ...recipe(), portions: '2' })).toBe(false)
    expect(isClientRecipe({ ...recipe(), picture_url: 1 })).toBe(false)
    expect(isClientRecipe({ ...recipe(), ingredients: 'none' })).toBe(false)
    expect(isClientRecipe({ ...recipe(), ingredients: [null] })).toBe(false)
    expect(
      isClientRecipe({
        ...recipe(),
        ingredients: [{ ...ingredient(), name: 1 }]
      })
    ).toBe(false)
    expect(
      isClientRecipe({
        ...recipe(),
        ingredients: [{ ...ingredient(), quantity: '1' }]
      })
    ).toBe(false)
    expect(
      isClientRecipe({
        ...recipe(),
        ingredients: [{ ...ingredient(), measure: 1 }]
      })
    ).toBe(false)
    expect(
      isClientRecipe({
        ...recipe(),
        ingredients: [{ ...ingredient(), category: 1 }]
      })
    ).toBe(false)
    expect(isClientRecipeList('nope')).toBe(false)
    expect(isClientRecipeList([recipe(), { name: 'bad' }])).toBe(false)
  })
})

describe('isClientRecipe tags', () => {
  it('requires a string array of tags', () => {
    expect(isClientRecipe(recipe({ tags: ['dinner'] }))).toBe(true)
    expect(isClientRecipe({ ...recipe(), tags: [1] })).toBe(false)
    expect(isClientRecipe(omit(recipe(), 'tags'))).toBe(false)
  })
})
