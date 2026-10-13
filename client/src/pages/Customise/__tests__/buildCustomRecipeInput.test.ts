import { DEFAULT_PICTURE_URL } from '../../../components/Widgets/RecipeCard/toRecipeInput'
import {
  buildCustomRecipeInput,
  toCustomIngredientInput
} from '../useCustomiseForm'

describe('toCustomIngredientInput', () => {
  it('defaults blank fields', () => {
    expect(
      toCustomIngredientInput({
        name: '',
        quantity: 0,
        measure: '',
        category: ''
      })
    ).toEqual({
      name: 'Ingredient',
      quantity: 1,
      measure: 'unit',
      category: 'Generic'
    })
  })
})

describe('buildCustomRecipeInput', () => {
  it('uses defaults when nothing is customised', () => {
    expect(
      buildCustomRecipeInput({
        name: '',
        portions: 0,
        ingredients: [],
        customiseRecipe: null
      })
    ).toEqual({
      name: 'Custom recipe',
      portions: 1,
      ingredients: [],
      instructions: '',
      picture_url: DEFAULT_PICTURE_URL,
      libraryId: '-1'
    })
  })
  it('keeps the customised recipe picture and library id', () => {
    const input = buildCustomRecipeInput({
      name: 'Dahl',
      portions: 4,
      ingredients: [
        { name: 'lentils', quantity: 2, measure: 'cup', category: 'pantry' }
      ],
      customiseRecipe: { picture_url: 'p.png', libraryId: 'lib' }
    })
    expect(input).toMatchObject({
      name: 'Dahl',
      portions: 4,
      picture_url: 'p.png',
      libraryId: 'lib'
    })
    expect(input.ingredients).toHaveLength(1)
  })
})
