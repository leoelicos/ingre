import ingredientData from '../../../data/ingredients.json'
import recipeData from '../../../data/recipes.json'
import {
  LibraryDataError,
  parseCatalogue,
  parseIngredient,
  parseRecipe,
  parseRecipes
} from '../parseLibrary'

const validIngredient = {
  id: 'garlic',
  name: 'garlic',
  category: 'fruit & veg',
  staple: true,
  sold: [
    { type: 'each', size: { amount: 1, unit: 'count' }, label: 'loose bulb' },
    { type: 'weighed', size: null }
  ],
  approxGrams: 60,
  measureGrams: { clove: 6 },
  pantry: 'Bench'
}
const validRecipe = {
  id: 'r',
  name: 'R',
  portions: 1,
  tags: ['dinner'],
  ingredients: [{ ingredientId: 'garlic', quantity: 1, measure: 'clove' }],
  method: ['Cook'],
  picture_url: '/p.png'
}

describe('bundled data', () => {
  it('validates the shipped catalogue and recipes', () => {
    expect(parseCatalogue(ingredientData).length).toBeGreaterThan(60)
    expect(parseRecipes(recipeData).length).toBeGreaterThan(10)
  })
})

describe('parseIngredient', () => {
  it('keeps every valid field', () => {
    expect(parseIngredient(validIngredient)).toEqual(validIngredient)
  })
  it('omits absent optional fields and non-true staple', () => {
    const { staple, approxGrams, measureGrams, ...rest } = validIngredient
    expect(parseIngredient({ ...rest, staple: false })).toEqual(rest)
    expect([staple, approxGrams, measureGrams]).toHaveLength(3)
  })
  it.each([
    ['not an object', null, 'ingredient: expected an object'],
    ['blank id', { ...validIngredient, id: '' }, 'ingredient.id'],
    [
      'bad aisle',
      { ...validIngredient, category: 'frozen' },
      'ingredient.category'
    ],
    [
      'bad location',
      { ...validIngredient, pantry: 'Pantry' },
      'ingredient.pantry'
    ],
    ['sold not array', { ...validIngredient, sold: {} }, 'ingredient.sold'],
    [
      'no sold options',
      { ...validIngredient, sold: [] },
      'at least one option'
    ],
    [
      'bad sold type',
      { ...validIngredient, sold: [{ type: 'box', size: null }] },
      'sold[0].type'
    ],
    [
      'weighed with size',
      {
        ...validIngredient,
        sold: [{ type: 'weighed', size: { amount: 1, unit: 'g' } }]
      },
      'null exactly when weighed'
    ],
    [
      'sized without size',
      { ...validIngredient, sold: [{ type: 'pack', size: null }] },
      'null exactly when weighed'
    ],
    [
      'bad unit',
      {
        ...validIngredient,
        sold: [{ type: 'pack', size: { amount: 1, unit: 'lb' } }]
      },
      'size.unit'
    ],
    [
      'zero amount',
      {
        ...validIngredient,
        sold: [{ type: 'pack', size: { amount: 0, unit: 'g' } }]
      },
      'size.amount'
    ],
    [
      'blank label',
      {
        ...validIngredient,
        sold: [{ type: 'pack', size: { amount: 1, unit: 'g' }, label: '' }]
      },
      'sold[0].label'
    ],
    [
      'bad approxGrams',
      { ...validIngredient, approxGrams: 'x' },
      'approxGrams'
    ],
    [
      'bad measureGrams',
      { ...validIngredient, measureGrams: { clove: -1 } },
      'measureGrams.clove'
    ]
  ])('rejects %s', (_label, value, message) => {
    expect(() => parseIngredient(value)).toThrow(LibraryDataError)
    expect(() => parseIngredient(value)).toThrow(message)
  })
})

describe('parseRecipe', () => {
  it('keeps a valid recipe, picture optional', () => {
    expect(parseRecipe(validRecipe)).toEqual(validRecipe)
    const { picture_url, ...noPicture } = validRecipe
    expect(parseRecipe(noPicture)).toEqual(noPicture)
    expect(picture_url).toBe('/p.png')
  })
  it.each([
    ['bad portions', { ...validRecipe, portions: 0 }, 'recipe.portions'],
    ['bad tag', { ...validRecipe, tags: [1] }, 'recipe.tags[0]'],
    [
      'bad ingredient',
      { ...validRecipe, ingredients: [{ ingredientId: 'x', quantity: 1 }] },
      'ingredients[0].measure'
    ],
    ['bad method', { ...validRecipe, method: [''] }, 'recipe.method[0]']
  ])('rejects %s', (_label, value, message) => {
    expect(() => parseRecipe(value)).toThrow(message)
  })
})

describe('parseCatalogue / parseRecipes', () => {
  it('reject non-object roots and missing arrays with a path', () => {
    expect(() => parseCatalogue([])).toThrow('catalogue: expected an object')
    expect(() => parseCatalogue({})).toThrow('catalogue.ingredients')
    expect(() => parseRecipes({ recipes: [null] })).toThrow('recipes[0]')
  })
})
