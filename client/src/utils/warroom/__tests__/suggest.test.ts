import { library } from '../../library/recipeLibrary'
import { goesWith, nearlyThere, suggestionsFor } from '../suggest'

const none = new Map<string, number>()

describe('goesWith', () => {
  it('suggests what shares recipes with the list, never what is on it, with a reason', () => {
    const found = goesWith(new Set(['beef-mince']), none)
    expect(found.length).toBeGreaterThan(0)
    found.forEach(({ tile, reason }) => {
      expect(tile.id).not.toBe('beef-mince')
      expect(reason).toEqual({ type: 'with', name: 'beef mince' })
    })
  })

  it('leans toward what this person adds', () => {
    const plain = goesWith(new Set(['beef-mince']), none)
    const last = plain[plain.length - 1]!.tile.id
    const leaned = goesWith(new Set(['beef-mince']), new Map([[last, 20]]))
    expect(leaned[0]?.tile.id).toBe(last)
  })

  it('is empty for an empty list', () => {
    expect(goesWith(new Set(), none)).toEqual([])
  })
})

describe('nearlyThere', () => {
  it('lists recipes with something on the list and at most three to buy, fewest first', () => {
    const recipe = library[0]!
    const onList = new Set(recipe.ingredients.map((i) => i.ingredientId))
    const found = nearlyThere(onList, new Set())
    expect(found[0]).toMatchObject({
      tile: { id: recipe.id },
      reason: { count: 0 }
    })
    const counts = found.map(({ reason }) =>
      reason.type === 'more' ? reason.count : -1
    )
    expect(counts).toEqual([...counts].sort((a, b) => a - b))
    counts.forEach((count) => expect(count).toBeLessThanOrEqual(3))
    expect(
      nearlyThere(onList, new Set([recipe.id])).map(({ tile }) => tile.id)
    ).not.toContain(recipe.id)
  })
})

describe('suggestionsFor', () => {
  const onList = new Set(['beef-mince', 'onion', 'garlic'])

  it('alternates ingredients and recipes for Both, within the slots', () => {
    const found = suggestionsFor('both', onList, new Set(), none, 4)
    expect(found).toHaveLength(4)
    expect(found.slice(0, 2).map(({ tile }) => tile.kind)).toEqual([
      'ingredient',
      'recipe'
    ])
  })

  it('keeps to one kind when toggled', () => {
    expect(
      suggestionsFor('ingredients', onList, new Set(), none, 5).every(
        ({ tile }) => tile.kind === 'ingredient'
      )
    ).toBe(true)
    expect(
      suggestionsFor('recipes', onList, new Set(), none, 5).every(
        ({ tile }) => tile.kind === 'recipe'
      )
    ).toBe(true)
  })

  it('is deterministic', () => {
    expect(suggestionsFor('both', onList, new Set(), none, 6)).toEqual(
      suggestionsFor('both', onList, new Set(), none, 6)
    )
  })
})

describe('nearlyThere, ties', () => {
  it('breaks a tie on what to buy and what is had by name', () => {
    const recipe = library[0]!
    const onList = new Set(recipe.ingredients.map((i) => i.ingredientId))
    const twins = [
      { ...recipe, id: `${recipe.id}-b`, name: 'B twin' },
      { ...recipe, id: `${recipe.id}-a`, name: 'A twin' },
      recipe
    ]
    expect(
      nearlyThere(onList, new Set(), twins).map(({ tile }) => tile.id)
    ).toEqual([recipe.id])
  })
})
