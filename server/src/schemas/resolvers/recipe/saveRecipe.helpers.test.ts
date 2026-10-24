import {
  buildRecipeFields,
  DEFAULT_PICTURE_URL,
  toCustomisationDocs,
  toSavedIngredient
} from './saveRecipe'
import { toCustomisation } from './toRecipePopulated'
import { resolveCustomisationType } from '../../resolvers'

const input = {
  name: 'Soup',
  portions: 2,
  ingredients: [],
  picture_url: 'pic.png',
  libraryId: 'lib-1',
  instructions: 'Boil',
  customisations: {
    added: [{ ingredientId: 'chilli', to: 1 }],
    removed: [{ ingredientId: 'butter', from: 25 }],
    changed: [{ ingredientId: 'cream', from: 0.25, to: 0.5 }],
    portions: { from: 2, to: 4 }
  }
}

describe('buildRecipeFields', () => {
  it('copies fields and attaches ingredients', () => {
    expect(buildRecipeFields(input, ['a'])).toEqual({
      name: 'Soup',
      portions: 2,
      instructions: 'Boil',
      ingredients: ['a'],
      picture_url: 'pic.png',
      libraryId: 'lib-1',
      customisations: [
        { kind: 'AddedIngredient', ingredientId: 'chilli', to: 1 },
        { kind: 'RemovedIngredient', ingredientId: 'butter', from: 25 },
        {
          kind: 'ChangedIngredient',
          ingredientId: 'cream',
          from: 0.25,
          to: 0.5
        },
        { kind: 'PortionsChange', from: 2, to: 4 }
      ]
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
      category: 'c',
      ingredientId: null
    })
  })
})

describe('toCustomisationDocs (#182)', () => {
  it('stores nothing when there are no changes', () => {
    expect(
      toCustomisationDocs({
        added: [],
        removed: [],
        changed: [],
        portions: null
      })
    ).toEqual([])
  })
})

describe('toCustomisation (#182)', () => {
  it('keeps only the amounts a change carries', () => {
    expect(
      toCustomisation({ kind: 'RemovedIngredient', ingredientId: 'b', from: 2 })
    ).toStrictEqual({ kind: 'RemovedIngredient', ingredientId: 'b', from: 2 })
    expect(
      toCustomisation({ kind: 'PortionsChange', from: 2, to: 4 })
    ).toStrictEqual({ kind: 'PortionsChange', from: 2, to: 4 })
  })
})

describe('resolveCustomisationType (#182)', () => {
  it('names the union member from the stored kind', () => {
    expect(resolveCustomisationType({ kind: 'ChangedIngredient' })).toBe(
      'ChangedIngredient'
    )
  })
})
