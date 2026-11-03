import { libRecipe } from '../../../test/fixtures'
import {
  EXPLICIT,
  NO_TASTE,
  affinity,
  idSignals,
  observedWeights,
  rankByTaste,
  recipeScore,
  recipeSignals
} from '../taste'
import type { Taste } from '../taste'

const line = (ingredientId: string) => ({
  ingredientId,
  quantity: 1,
  measure: 'g'
})
const beefy = libRecipe({
  id: 'b',
  name: 'Beef thing',
  ingredients: [line('beef-mince'), line('onion')]
})
const veg = libRecipe({
  id: 'v',
  name: 'Veg thing',
  ingredients: [line('carrot'), line('potato')]
})
const rice = libRecipe({
  id: 'r',
  name: 'A rice thing',
  ingredients: [line('jasmine-rice')]
})

describe('observed weights (#224)', () => {
  it('turns what the user did into class shares that add up to 1', () => {
    const weights = observedWeights([
      ...recipeSignals([beefy], 1),
      ...idSignals(['beef-mince'], 2)
    ])
    expect(weights.get('beef')).toBeCloseTo(0.75)
    expect(weights.get('allium')).toBeCloseTo(0.25)
    expect([...weights.values()].reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })

  it('has no weights with no behaviour, and ignores what is not in the catalogue', () => {
    expect(observedWeights([]).size).toBe(0)
    expect(observedWeights(idSignals(['free text'], 2)).size).toBe(0)
  })
})

describe('affinity (#224)', () => {
  const observed: Taste = {
    ...NO_TASTE,
    weights: observedWeights(recipeSignals([veg], 1))
  }

  it('is a class share plus a pull from its group', () => {
    expect(affinity(observed, 'root-vegetable')).toBeCloseTo(1 + 0.5)
    expect(affinity(observed, 'allium')).toBeCloseTo(0.5)
    expect(affinity(observed, 'beef')).toBe(0)
  })

  it('lets an explicit like or dislike override what was observed', () => {
    const disliked = {
      ...observed,
      dislikes: new Set(['root-vegetable' as const])
    }
    expect(affinity(disliked, 'root-vegetable')).toBe(-EXPLICIT)
    const liked = { ...NO_TASTE, likes: new Set(['beef' as const]) }
    expect(affinity(liked, 'beef')).toBe(EXPLICIT)
  })

  it('makes a dislike beat a like of the same class', () => {
    const both = {
      ...NO_TASTE,
      likes: new Set(['beef' as const]),
      dislikes: new Set(['beef' as const])
    }
    expect(affinity(both, 'beef')).toBe(-EXPLICIT)
  })

  it('stays below an explicit like however much was observed', () => {
    const only = {
      ...NO_TASTE,
      weights: observedWeights(idSignals(['beef-mince'], 5))
    }
    expect(affinity(only, 'beef')).toBeLessThan(EXPLICIT)
  })
})

describe('ranking recipes by taste (#224)', () => {
  const lovesVeg: Taste = {
    ...NO_TASTE,
    weights: observedWeights(recipeSignals([veg], 1))
  }

  it('scores the mean affinity of the ingredients, and an empty recipe 0', () => {
    expect(recipeScore(lovesVeg, rice)).toBe(0)
    expect(recipeScore(lovesVeg, libRecipe({ ingredients: [] }))).toBe(0)
    expect(recipeScore(lovesVeg, beefy)).toBeCloseTo(0.25)
  })

  it('puts the best match first and falls back to A to Z with no history', () => {
    expect(rankByTaste([rice, beefy, veg], lovesVeg).map((r) => r.id)).toEqual([
      'v',
      'b',
      'r'
    ])
    expect(rankByTaste([veg, beefy, rice], NO_TASTE).map((r) => r.id)).toEqual([
      'r',
      'b',
      'v'
    ])
  })
})
