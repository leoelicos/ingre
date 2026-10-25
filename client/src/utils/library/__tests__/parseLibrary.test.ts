import ingredientData from '../../../data/ingredients.json'
import recipeData from '../../../data/recipes.json'
import {
  LibraryDataError,
  parseCatalogue,
  parseSectionColours,
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
  pantry: 'Bench',
  allergens: ['sesame']
}
const validRecipe = {
  id: 'r',
  name: 'R',
  portions: 1,
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
    [
      'allergens missing',
      { ...validIngredient, allergens: null },
      'ingredient.allergens: expected an array'
    ],
    [
      'blank allergen',
      { ...validIngredient, allergens: [''] },
      'ingredient.allergens[0]'
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

describe('no key ingredients (#191)', () => {
  it('drops a stray keyIngredients field and ships none', () => {
    expect(
      parseRecipe({ ...validRecipe, keyIngredients: ['onion'] })
    ).not.toHaveProperty('keyIngredients')
    expect(
      recipeData.recipes.some((r) => Object.keys(r).includes('keyIngredients'))
    ).toBe(false)
  })
})

describe('parseCatalogue / parseRecipes', () => {
  it('reject non-object roots and missing arrays with a path', () => {
    expect(() => parseCatalogue([])).toThrow('catalogue: expected an object')
    expect(() => parseCatalogue({})).toThrow('catalogue.ingredients')
    expect(() => parseRecipes({ recipes: [null] })).toThrow('recipes[0]')
  })
})

describe('no badge codes (#191)', () => {
  it('drops a stray badgeCode field and ships none', () => {
    expect(
      parseIngredient({
        id: 'fresh-mint',
        name: 'fresh mint',
        category: 'fruit & veg',
        sold: [{ type: 'bunch', size: { amount: 1, unit: 'count' } }],
        pantry: 'Fridge',
        allergens: [],
        badgeCode: 'MNT'
      })
    ).not.toHaveProperty('badgeCode')
    expect(
      ingredientData.ingredients.some((i) =>
        Object.keys(i).includes('badgeCode')
      )
    ).toBe(false)
  })
})

describe('parseIngredient countUnit and partMeasure (#182)', () => {
  const base = {
    id: 'garlic',
    name: 'garlic',
    category: 'fruit & veg',
    sold: [{ type: 'each', size: { amount: 1, unit: 'count' } }],
    pantry: 'Bench',
    allergens: []
  }

  it('keeps a count unit and a part, and leaves them out when absent', () => {
    const garlic = parseIngredient({
      ...base,
      countUnit: { one: 'head', other: 'heads' },
      partMeasure: 'clove'
    })
    expect(garlic.countUnit).toEqual({ one: 'head', other: 'heads' })
    expect(garlic.partMeasure).toBe('clove')
    expect(parseIngredient(base)).not.toHaveProperty('countUnit')
    expect(parseIngredient(base)).not.toHaveProperty('partMeasure')
  })

  it('fails loudly on a bad count unit or part', () => {
    expect(() => parseIngredient({ ...base, countUnit: 'heads' }, 'x')).toThrow(
      'x.countUnit: expected an object'
    )
    expect(() =>
      parseIngredient({ ...base, countUnit: { one: 'head' } }, 'x')
    ).toThrow('x.countUnit.other: expected a non-empty string')
    expect(() =>
      parseIngredient({ ...base, countUnit: { one: '', other: 'heads' } }, 'x')
    ).toThrow('x.countUnit.one: expected a non-empty string')
    expect(() => parseIngredient({ ...base, partMeasure: 3 }, 'x')).toThrow(
      'x.partMeasure: expected a non-empty string'
    )
  })
})

describe('parseSectionColours', () => {
  const valid = {
    sectionColours: {
      'Fruit & Veg': 'produce',
      'Meat & Seafood': 'meat',
      'Dairy, Eggs & Fridge': 'dairy',
      Deli: 'deli',
      Bakery: 'bakery',
      Pantry: 'pantry',
      Frozen: 'frozen',
      Other: 'neutral'
    }
  }

  it('maps every shop section to a badge tone, produce green', () => {
    expect(parseSectionColours(valid)).toEqual(valid.sectionColours)
    expect(parseSectionColours(ingredientData)['Fruit & Veg']).toBe('produce')
  })

  it('fails loudly on a missing map', () => {
    expect(() => parseSectionColours({})).toThrow(
      'catalogue.sectionColours: expected an object'
    )
  })

  it('names the section and the bad value for an unknown colour', () => {
    const bad = () =>
      parseSectionColours({
        sectionColours: { ...valid.sectionColours, Deli: 'pink' }
      })
    expect(bad).toThrow(LibraryDataError)
    expect(bad).toThrow(
      'catalogue.sectionColours.Deli: "pink" is not a known colour'
    )
    expect(() =>
      parseSectionColours({
        sectionColours: { ...valid.sectionColours, Bakery: 7 }
      })
    ).toThrow('Bakery: 7 is not a known colour')
  })

  it('names a missing section', () => {
    const { Frozen: _frozen, ...missing } = valid.sectionColours
    expect(() => parseSectionColours({ sectionColours: missing })).toThrow(
      'catalogue.sectionColours.Frozen: nothing is not a known colour'
    )
  })

  it('rejects an unknown section key', () => {
    expect(() =>
      parseSectionColours({
        sectionColours: { ...valid.sectionColours, Seafood: 'meat' }
      })
    ).toThrow(
      new LibraryDataError(
        'catalogue.sectionColours.Seafood: "Seafood" is not a known section (expected one of Fruit & Veg, Meat & Seafood, Dairy, Eggs & Fridge, Deli, Bakery, Pantry, Frozen, Other)'
      )
    )
  })

  it('reports a miscased key as unknown, not as a missing section', () => {
    const { Deli: _deli, ...rest } = valid.sectionColours
    expect(() =>
      parseSectionColours({ sectionColours: { ...rest, deli: 'deli' } })
    ).toThrow('catalogue.sectionColours.deli: "deli" is not a known section')
  })
})
