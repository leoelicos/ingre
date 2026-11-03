import { libIngredient, libRecipe } from '../../../test/fixtures'
import type { ExploreSource } from '../exploreSearch'
import {
  alphabetical,
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
  savedIds: new Set()
}
const names = (items: readonly { name: string }[]) => items.map((i) => i.name)

describe('aliases (#239)', () => {
  const coriander = libIngredient({
    id: 'coriander',
    name: 'fresh coriander',
    aliases: ['cilantro']
  })
  const curry = libRecipe({
    id: 'green-curry',
    name: 'Green curry',
    ingredients: [{ ingredientId: 'coriander', quantity: 1, measure: 'g' }]
  })
  const withAlias: ExploreSource = {
    ...source,
    recipes: [...recipes, curry],
    ingredients: [...ingredients, coriander]
  }

  it('an ingredient is found by its alias, keeping its one name', () => {
    expect(ingredientMatches(coriander, 'cilantro')).toBe(true)
    expect(ingredientMatches(coriander, 'coriander')).toBe(true)
    expect(ingredientMatches(coriander, 'parsley')).toBe(false)
    const results = exploreResults('cilantro', withAlias)
    expect(results.kind).toBe('matches')
    expect(
      results.kind === 'matches' ? names(results.ingredients) : []
    ).toEqual(['fresh coriander'])
  })

  it('a recipe is found by an alias of one of its ingredients', () => {
    const results = exploreResults('cilantro', withAlias)
    expect(results.kind === 'matches' ? names(results.recipes) : []).toEqual([
      'Green curry'
    ])
  })

  it('an alias that starts the query ranks above a name that only contains it', () => {
    const cumin = libIngredient({ id: 'c', name: 'ground cilantro seed' })
    expect(names(ranked([cumin, coriander], 'cilantro'))).toEqual([
      'fresh coriander',
      'ground cilantro seed'
    ])
  })

  it('close matches also look at aliases', () => {
    expect(names(closeMatches([coriander], 'cilantr'))).toEqual([
      'fresh coriander'
    ])
  })
})

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
    expect(names(alphabetical(items))).toEqual([
      'A chick',
      'B chick',
      'chick z'
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
