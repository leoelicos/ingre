import { libIngredient, libRecipe } from '../../../test/fixtures'
import { NO_PERSONAL } from '../../profile/personal'
import type { ExploreSource } from '../exploreSearch'
import {
  allowedRecipes,
  closeMatches,
  exploreResults,
  ingredientMatches,
  ranked,
  shownRecipes,
  tierOf
} from '../exploreSearch'

const ingredients = [
  libIngredient({ id: 'chicken', name: 'chicken thigh fillets' }),
  libIngredient({ id: 'chickpeas', name: 'tinned chickpeas' }),
  libIngredient({ id: 'rice', name: 'jasmine rice' })
]
const recipes = [
  libRecipe({
    id: 'rice',
    name: 'Hainan chicken rice',
    ingredients: [{ ingredientId: 'rice', quantity: 1, measure: 'cup' }]
  }),
  libRecipe({ id: 'curry', name: 'Chickpea curry' }),
  libRecipe({ id: 'stew', name: 'Beef stew' }),
  libRecipe({
    id: 'salad',
    name: 'Garden salad',
    ingredients: [{ ingredientId: 'chickpeas', quantity: 1, measure: 'g' }]
  })
]
const source: ExploreSource = {
  recipes,
  ingredients,
  savedOnly: false,
  savedIds: new Set(),
  personal: NO_PERSONAL
}
const names = (items: readonly { name: string }[]) => items.map((i) => i.name)

describe('ranking (#181)', () => {
  it('ranks starts-with, then a word starting with it, then contains, then the rest', () => {
    expect(tierOf('Chickpea curry', 'chick')).toBe(0)
    expect(tierOf('Hainan chicken rice', 'chick')).toBe(1)
    expect(tierOf('Hainan chicken rice', 'icken')).toBe(2)
    expect(tierOf('Garden salad', 'chick')).toBe(3)
  })

  it('is alphabetical within a tier', () => {
    const items = [
      { name: 'B chick' },
      { name: 'A chick' },
      { name: 'chick z' }
    ]
    expect(names(ranked(items, 'chick'))).toEqual([
      'chick z',
      'A chick',
      'B chick'
    ])
  })

  it('needs every word in an ingredient name', () => {
    expect(
      ingredientMatches(libIngredient({ name: 'jasmine rice' }), 'rice jas')
    ).toBe(true)
    expect(
      ingredientMatches(libIngredient({ name: 'jasmine rice' }), 'rice brown')
    ).toBe(false)
  })
})

describe('exploreResults (#181)', () => {
  it('browses every recipe alphabetically when blank', () => {
    expect(exploreResults('  ', source)).toEqual({
      kind: 'browse',
      recipes: [recipes[2], recipes[1], recipes[3], recipes[0]]
    })
  })

  it('groups ingredients and recipes, ranked, matching names and ingredients', () => {
    const results = exploreResults('chick', source)
    if (results.kind !== 'matches') throw new Error(results.kind)
    expect(names(results.ingredients)).toEqual([
      'chicken thigh fillets',
      'tinned chickpeas'
    ])
    // the salad matches through its chickpeas: last tier
    expect(names(results.recipes)).toEqual([
      'Chickpea curry',
      'Hainan chicken rice',
      'Garden salad'
    ])
  })

  it('says none and offers close matches from Fuse, then browse', () => {
    const results = exploreResults('chikpea', source)
    if (results.kind !== 'none') throw new Error(results.kind)
    expect(names(results.ingredients)).toContain('tinned chickpeas')
    expect(names(results.recipes)).toContain('Chickpea curry')
    expect(results.browse).toHaveLength(4)
    expect(closeMatches(recipes, 'zzzzqqq')).toEqual([])
  })

  it('Saved filters only the recipes', () => {
    const saved = { ...source, savedOnly: true, savedIds: new Set(['stew']) }
    expect(names(shownRecipes(saved))).toEqual(['Beef stew'])
    const results = exploreResults('chick', saved)
    if (results.kind !== 'matches') throw new Error(results.kind)
    expect(results.recipes).toEqual([])
    expect(results.ingredients).toHaveLength(2)
  })
})

describe('exploreResults with a profile (#224)', () => {
  const beef = libRecipe({
    id: 'beef',
    name: 'Zesty beef',
    ingredients: [{ ingredientId: 'beef-mince', quantity: 1, measure: 'g' }]
  })
  const rice = libRecipe({
    id: 'jasmine',
    name: 'Aromatic rice',
    ingredients: [{ ingredientId: 'jasmine-rice', quantity: 1, measure: 'g' }]
  })
  const items = [
    libIngredient({ id: 'beef-mince', name: 'beef mince' }),
    libIngredient({ id: 'jasmine-rice', name: 'jasmine rice' })
  ]
  const base: ExploreSource = {
    ...source,
    recipes: [beef, rice],
    ingredients: items
  }
  const liking = (like: 'rice' | 'beef'): ExploreSource => ({
    ...base,
    personal: {
      taste: { ...NO_PERSONAL.taste, likes: new Set([like]) },
      locks: NO_PERSONAL.locks
    }
  })

  it('browses best match for the profile first, and A to Z with no history', () => {
    expect(names(exploreResults('', base).recipes)).toEqual([
      'Aromatic rice',
      'Zesty beef'
    ])
    expect(names(exploreResults('', liking('beef')).recipes)).toEqual([
      'Zesty beef',
      'Aromatic rice'
    ])
  })

  it('never shows a recipe a lock rules out, however it is found', () => {
    const vegetarian: ExploreSource = {
      ...liking('beef'),
      personal: {
        taste: liking('beef').personal.taste,
        locks: { allergens: [], diet: 'vegetarian' }
      }
    }
    expect(names(shownRecipes(vegetarian))).toEqual(['Aromatic rice'])
    expect(names(exploreResults('', vegetarian).recipes)).toEqual([
      'Aromatic rice'
    ])
    const results = exploreResults('zesty', vegetarian)
    if (results.kind !== 'none') throw new Error(results.kind)
    expect(names(results.recipes)).not.toContain('Zesty beef')
    expect(names(allowedRecipes(vegetarian))).toEqual(['Aromatic rice'])
  })
})
