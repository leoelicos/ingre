import { catalogue, library } from '../../library/recipeLibrary'
import {
  exportRecipes,
  importNode,
  importRecipes,
  ingredientLine,
  portionsOf,
  recipeNodes,
  stepsOf,
  toJsonLd
} from '../jsonld'

const dahl = library.find((recipe) => recipe.id === 'dahl')

const recipe = (extra: Record<string, unknown> = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: 'Lentil soup',
  recipeYield: '4 servings',
  recipeIngredient: ['200 g red lentils', '1 brown onion', '2 unicorn horns'],
  recipeInstructions: ['Chop.', 'Simmer.'],
  ...extra
})

describe('export (#230)', () => {
  it('writes one line per ingredient: quantity, unit unless whole items, name', () => {
    expect(ingredientLine(200, 'g', 'red lentils')).toBe('200 g red lentils')
    expect(ingredientLine(2, 'whole', 'brown onion')).toBe('2 brown onion')
  })

  it('writes a schema.org Recipe', () => {
    if (dahl === undefined) throw new Error('dahl missing')
    const ld = toJsonLd(dahl, catalogue)
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('Recipe')
    expect(ld.name).toBe(dahl.name)
    expect(ld.recipeYield).toBe(`${dahl.portions} servings`)
    expect(ld.recipeIngredient).toHaveLength(dahl.ingredients.length)
    expect(ld.recipeInstructions[0]).toEqual({
      '@type': 'HowToStep',
      text: dahl.method[0]
    })
  })

  it('names an ingredient by id when the catalogue does not know it', () => {
    const lonely = {
      id: 'x',
      name: 'X',
      portions: 1,
      method: [],
      ingredients: [{ ingredientId: 'mystery', quantity: 1, measure: 'g' }]
    }
    expect(toJsonLd(lonely, catalogue).recipeIngredient).toEqual([
      '1 g mystery'
    ])
  })

  it('exports a list of recipes as JSON text', () => {
    if (dahl === undefined) throw new Error('dahl missing')
    const text = exportRecipes([dahl], catalogue)
    expect(JSON.parse(text)).toHaveLength(1)
  })

  it('round trips: what is exported imports back with the same ingredients', () => {
    const text = exportRecipes(
      library.filter((r) => r.id !== 'x'),
      catalogue
    )
    const result = importRecipes(text, catalogue)
    if (!result.ok) throw new Error('did not import')
    expect(result.recipes).toHaveLength(library.length)
    result.recipes.forEach(({ recipe: back, unmatched }, index) => {
      const original = library[index]
      expect(unmatched).toEqual([])
      expect(back.name).toBe(original?.name)
      expect(back.portions).toBe(original?.portions)
      expect(back.ingredients.map((i) => i.ingredientId)).toEqual(
        original?.ingredients.map((i) => i.ingredientId)
      )
      expect(back.method).toEqual(original?.method)
    })
  })
})

describe('recipeNodes (#230)', () => {
  it('finds a node, a list, an @graph and a list of types', () => {
    expect(recipeNodes(recipe())).toHaveLength(1)
    expect(recipeNodes([recipe(), recipe()])).toHaveLength(2)
    expect(
      recipeNodes({ '@graph': [{ '@type': 'WebPage' }, recipe()] })
    ).toHaveLength(1)
    expect(recipeNodes(recipe({ '@type': ['Thing', 'Recipe'] }))).toHaveLength(
      1
    )
  })

  it('ignores everything else', () => {
    expect(recipeNodes('text')).toEqual([])
    expect(recipeNodes(null)).toEqual([])
    expect(recipeNodes({ '@type': 'Person' })).toEqual([])
  })
})

describe('stepsOf and portionsOf (#230)', () => {
  it('reads a string, a list, HowToStep and HowToSection', () => {
    expect(stepsOf('Mix.')).toEqual(['Mix.'])
    expect(stepsOf([' Mix. ', ''])).toEqual(['Mix.'])
    expect(stepsOf([{ '@type': 'HowToStep', text: 'Mix.' }])).toEqual(['Mix.'])
    expect(
      stepsOf([
        {
          '@type': 'HowToSection',
          itemListElement: [{ text: 'A' }, { text: 'B' }]
        }
      ])
    ).toEqual(['A', 'B'])
    expect(stepsOf({ text: ' ' })).toEqual([])
    expect(stepsOf(undefined)).toEqual([])
  })

  it('reads servings from a number, a string or a list; two when unclear', () => {
    expect(portionsOf(4)).toBe(4)
    expect(portionsOf('6 servings')).toBe(6)
    expect(portionsOf(['8', '8 servings'])).toBe(8)
    expect(portionsOf('lots')).toBe(2)
    expect(portionsOf(undefined)).toBe(2)
    expect(portionsOf(0)).toBe(2)
  })
})

describe('importRecipes (#230)', () => {
  it('imports a recipe with matched ingredients and reports the lines it could not match', () => {
    const result = importRecipes(JSON.stringify(recipe()), catalogue)
    if (!result.ok) throw new Error('did not import')
    const [imported] = result.recipes
    expect(imported?.recipe).toEqual({
      id: 'imported-lentil-soup',
      name: 'Lentil soup',
      portions: 4,
      ingredients: [
        { ingredientId: 'red-lentils', quantity: 200, measure: 'g' },
        { ingredientId: 'onion', quantity: 1, measure: 'whole' }
      ],
      method: ['Chop.', 'Simmer.']
    })
    expect(imported?.unmatched).toEqual(['2 unicorn horns'])
    expect(result.skipped).toEqual([])
  })

  it('skips a recipe without ingredients we know, or without a name, and says so', () => {
    const text = JSON.stringify([
      recipe({ name: 'Moon cheese', recipeIngredient: ['1 moon'] }),
      recipe({ name: undefined }),
      recipe()
    ])
    const result = importRecipes(text, catalogue)
    if (!result.ok) throw new Error('did not import')
    expect(result.recipes).toHaveLength(1)
    expect(result.skipped).toEqual(['Moon cheese', 'A recipe without a name'])
  })

  it('says why when there is nothing to import', () => {
    expect(importRecipes('{nope', catalogue)).toEqual({
      ok: false,
      reason: 'notJson'
    })
    expect(importRecipes('{"@type":"Person"}', catalogue)).toEqual({
      ok: false,
      reason: 'noRecipe'
    })
  })

  it('importNode is null without ingredients', () =>
    expect(importNode({ name: 'A' }, catalogue)).toBeNull())
})
