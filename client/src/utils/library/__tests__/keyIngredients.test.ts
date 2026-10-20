import { libIngredient, libRecipe } from '../../../test/fixtures'
import {
  UNKNOWN_CATEGORY,
  UNKNOWN_SECTION,
  keyIngredient,
  keyIngredientsFor,
  keyIngredientsOf,
  nameFromId,
  unknownIngredient
} from '../keyIngredients'
import { catalogue, library } from '../recipeLibrary'

describe('key ingredients', () => {
  it('draws a catalogue item with its resolved code, list casing and section', () => {
    expect(keyIngredient('crushed-tomatoes')).toEqual({
      id: 'crushed-tomatoes',
      name: 'Canned crushed tomatoes',
      code: 'CCT',
      category: 'canned food',
      section: 'Pantry'
    })
    expect(keyIngredient('cucumber').name).toBe('Lebanese cucumber')
    expect(keyIngredient('tomato').code).toBe('TOM')
  })

  it('gives anything outside the catalogue a plain neutral "?", never a generated code', () => {
    expect(unknownIngredient('dragon-fruit')).toEqual({
      id: 'dragon-fruit',
      name: 'Dragon fruit',
      code: '?',
      category: UNKNOWN_CATEGORY,
      section: UNKNOWN_SECTION
    })
    expect(keyIngredient('dragon-fruit', [libIngredient()]).code).toBe('?')
    expect(nameFromId('rice-paper')).toBe('rice paper')
  })

  it('keeps the listed order and is empty when a recipe names none', () => {
    const recipe = libRecipe({ keyIngredients: ['onion', 'mystery'] })
    expect(
      keyIngredientsOf(recipe, [libIngredient()]).map((k) => k.code)
    ).toEqual(['BON', '?'])
    expect(keyIngredientsOf(libRecipe({}))).toEqual([])
    expect(keyIngredientsFor(undefined)).toEqual([])
    expect(keyIngredientsFor('no-such-recipe')).toEqual([])
    expect(keyIngredientsFor('dahl').map((k) => k.name)).toEqual([
      'Red lentils',
      'Tomatoes',
      'Ground turmeric'
    ])
  })

  it('every library recipe names 1 to 3 key ingredients, all in the catalogue', () => {
    library.forEach((recipe) => {
      const keys = keyIngredientsOf(recipe, catalogue)
      expect(keys.length).toBeGreaterThan(0)
      expect(keys.length).toBeLessThanOrEqual(3)
      keys.forEach((key) => expect(key.code).not.toBe('?'))
    })
  })
})
