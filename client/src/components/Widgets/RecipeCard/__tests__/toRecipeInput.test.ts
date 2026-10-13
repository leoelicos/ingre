import { ingredient, omit, recipe } from '../../../../test/fixtures'
import {
  DEFAULT_PICTURE_URL,
  toIngredientInput,
  toRecipeInput
} from '../toRecipeInput'

describe('toIngredientInput', () => {
  it('keeps provided values', () => {
    expect(toIngredientInput(ingredient())).toEqual({
      name: 'Tomato',
      quantity: 1,
      measure: 'cup',
      category: 'produce'
    })
  })

  it('fills blanks with defaults and drops _id', () => {
    expect(
      toIngredientInput(
        ingredient({ name: '', quantity: 0, measure: '', category: '' })
      )
    ).toEqual({
      name: 'Ingredient',
      quantity: 1,
      measure: 'unit',
      category: 'Generic'
    })
  })
})

describe('toRecipeInput', () => {
  it('maps a complete recipe', () => {
    expect(toRecipeInput(recipe())).toEqual({
      name: 'Pasta',
      portions: 2,
      picture_url: 'http://pic.example/pasta.jpg',
      libraryId: 'ed1',
      instructions: 'Boil',
      ingredients: [toIngredientInput(ingredient())]
    })
  })

  it('fills defaults and omits absent optional fields', () => {
    const input = toRecipeInput(
      omit(
        recipe({ name: '', portions: 0, picture_url: '', ingredients: [] }),
        'libraryId',
        'instructions'
      )
    )
    expect(input).toEqual({
      name: 'Untitled Recipe',
      portions: 1,
      picture_url: DEFAULT_PICTURE_URL,
      ingredients: []
    })
    expect('libraryId' in input).toBe(false)
    expect('instructions' in input).toBe(false)
  })

  it('keeps an empty libraryId but omits empty instructions', () => {
    const input = toRecipeInput(recipe({ libraryId: '', instructions: '' }))
    expect(input.libraryId).toBe('')
    expect('instructions' in input).toBe(false)
  })
})
