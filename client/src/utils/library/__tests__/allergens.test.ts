import { containsLine, recipeAllergens } from '../allergens'
import { catalogue, library } from '../recipeLibrary'
import { libIngredient, libRecipe } from '../../../test/fixtures'

const ing = (id: string, allergens: string[], staple = false) =>
  libIngredient({ id, name: id, allergens, ...(staple ? { staple } : {}) })
const recipeOf = (...ids: string[]) =>
  libRecipe({
    ingredients: ids.map((ingredientId) => ({
      ingredientId,
      quantity: 1,
      measure: 'g'
    }))
  })

describe('recipeAllergens', () => {
  it('dedupes, lowercases and sorts, keeping qualifiers in full', () => {
    const items = [
      ing('soy-sauce', ['Soy', 'wheat']),
      ing('almonds', ['tree nut (almond)']),
      ing('butter', ['milk']),
      ing('hoisin', ['soy', 'WHEAT'])
    ]
    expect(
      recipeAllergens(
        recipeOf('soy-sauce', 'almonds', 'butter', 'hoisin'),
        items
      )
    ).toEqual(['milk', 'soy', 'tree nut (almond)', 'wheat'])
  })

  it('counts every ingredient, staples included', () => {
    const items = [ing('sesame-oil', ['sesame'], true), ing('rice', [])]
    expect(recipeAllergens(recipeOf('sesame-oil', 'rice'), items)).toEqual([
      'sesame'
    ])
  })

  it('ignores catalogue items the recipe does not use, and unknown ids', () => {
    const items = [ing('egg', ['egg']), ing('rice', [])]
    expect(recipeAllergens(recipeOf('rice', 'missing'), items)).toEqual([])
  })

  it('derives the real library allergens', () => {
    const of = (id: string) =>
      recipeAllergens(
        library.find((r) => r.id === id) ?? recipeOf('none'),
        catalogue
      )
    expect(of('chicken-korma')).toEqual(['milk', 'tree nut (almond)'])
    expect(of('shaking-beef')).toEqual([
      'fish',
      'milk',
      'mollusc',
      'soy',
      'wheat'
    ])
    expect(of('beef-keema')).toEqual([])
  })
})

describe('containsLine', () => {
  it('joins allergens, or is empty when there are none', () => {
    expect(containsLine(['milk', 'tree nut (almond)'])).toBe(
      'Contains: milk, tree nut (almond)'
    )
    expect(containsLine([])).toBe('')
  })
})
