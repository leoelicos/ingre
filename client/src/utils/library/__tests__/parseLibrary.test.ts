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

describe('parseRecipe keyIngredients', () => {
  const withKeys = (keyIngredients: unknown) => ({
    ...validRecipe,
    ingredients: [
      { ingredientId: 'garlic', quantity: 1, measure: 'clove' },
      { ingredientId: 'onion', quantity: 1, measure: 'whole' },
      { ingredientId: 'salt', quantity: 1, measure: 'pinch' },
      { ingredientId: 'egg', quantity: 1, measure: 'whole' }
    ],
    keyIngredients
  })

  it('keeps 1 to 3 of the recipe’s own ingredient ids, in order, and leaves them out when absent', () => {
    expect(parseRecipe(withKeys(['onion', 'garlic'])).keyIngredients).toEqual([
      'onion',
      'garlic'
    ])
    expect(parseRecipe(validRecipe)).not.toHaveProperty('keyIngredients')
  })

  it.each<[string, unknown, string]>([
    ['not an array', 'onion', 'r.keyIngredients: expected an array'],
    [
      'an id the recipe does not use',
      ['onion', 'tomato'],
      'r.keyIngredients[1]: expected an ingredientId of this recipe'
    ],
    ['a blank id', [''], 'r.keyIngredients[0]: expected a non-empty string'],
    ['none', [], 'r.keyIngredients: expected 1 to 3 different ingredient ids'],
    [
      'more than three',
      ['garlic', 'onion', 'salt', 'egg'],
      'r.keyIngredients: expected 1 to 3 different ingredient ids'
    ],
    [
      'a repeat',
      ['onion', 'onion'],
      'r.keyIngredients: expected 1 to 3 different ingredient ids'
    ]
  ])('fails loudly on %s', (_label, keys, message) => {
    expect(() => parseRecipe(withKeys(keys), 'r')).toThrow(
      new LibraryDataError(message)
    )
  })

  it('loads key ingredients for every shipped recipe', () => {
    expect(
      parseRecipes(recipeData).every((r) => r.keyIngredients !== undefined)
    ).toBe(true)
  })
})

describe('parseCatalogue / parseRecipes', () => {
  it('reject non-object roots and missing arrays with a path', () => {
    expect(() => parseCatalogue([])).toThrow('catalogue: expected an object')
    expect(() => parseCatalogue({})).toThrow('catalogue.ingredients')
    expect(() => parseRecipes({ recipes: [null] })).toThrow('recipes[0]')
  })
})

describe('parseIngredient badgeCode', () => {
  const base = {
    id: 'fresh-mint',
    name: 'fresh mint',
    category: 'fruit & veg',
    sold: [{ type: 'bunch', size: { amount: 1, unit: 'count' } }],
    pantry: 'Fridge',
    allergens: []
  }

  it('keeps a valid three-letter code and leaves it out when absent', () => {
    expect(parseIngredient({ ...base, badgeCode: 'MNT' }).badgeCode).toBe('MNT')
    expect(parseIngredient(base)).not.toHaveProperty('badgeCode')
  })

  it.each(['mnt', 'MN', 'MINT', 'M1T', 'MÑT', '', 123, null])(
    'fails loudly on badgeCode %p',
    (badgeCode) => {
      expect(() => parseIngredient({ ...base, badgeCode }, 'x')).toThrow(
        new LibraryDataError(
          'x.badgeCode: expected exactly 3 upper-case letters A-Z'
        )
      )
    }
  )

  it('loads the overrides from the real catalogue', () => {
    expect(
      parseCatalogue(ingredientData).filter((i) => i.badgeCode !== undefined)
        .length
    ).toBe(32)
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
