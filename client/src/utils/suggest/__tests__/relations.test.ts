import type { LibraryIngredient, LibraryRecipe } from '../../../types/library'
import { catalogue } from '../../library/recipeLibrary'
import {
  MAX_COMPLEMENTS,
  bundledRelations,
  complementsOf,
  relationsOf
} from '../relations'

/* Acceptance for #205: every ingredient exposes the same relations: its shop section, what goes with it, the recipes that use it, and suggestions with what is missing and the cost. */

const item = (id: string, staple = false): LibraryIngredient => ({
  id,
  name: id,
  category: 'fruit & veg',
  sold: [],
  pantry: 'Fridge',
  allergens: [],
  ...(staple ? { staple } : {})
})

const recipe = (id: string, ...ids: string[]): LibraryRecipe => ({
  id,
  name: id,
  portions: 1,
  ingredients: ids.map((ingredientId) => ({
    ingredientId,
    quantity: 1,
    measure: 'whole'
  })),
  method: []
})

const ids = (items: readonly { id: string }[]) => items.map((i) => i.id)

const A = item('a')
const LONELY = item('lonely')
const items = ['b', 'c', 'd', 'e', 'f', 'g']
  .map((id) => item(id))
  .concat(A, LONELY, item('salt', true))
const recipes = [
  recipe('r1', 'a', 'b', 'c', 'salt'),
  recipe('r2', 'a', 'b', 'd', 'salt'),
  recipe('r3', 'a', 'c', 'e'),
  recipe('r4', 'a', 'f', 'g'),
  recipe('r5', 'b', 'f')
]
const prices: ReadonlyMap<string, number> = new Map(items.map((i) => [i.id, 1]))

describe('complementsOf: what goes with an ingredient (#205)', () => {
  it('ranks the other ingredients by how many recipes they share, then by name', () => {
    expect(ids(complementsOf('a', recipes, items))).toEqual([
      'b',
      'c',
      'd',
      'e',
      'f'
    ])
  })

  it('never lists the ingredient itself or a pantry staple', () => {
    const result = ids(complementsOf('a', recipes, items))
    expect(result).not.toContain('a')
    expect(result).not.toContain('salt')
  })

  it('stops at the most it shows', () => {
    expect(MAX_COMPLEMENTS).toBe(5)
    expect(complementsOf('a', recipes, items)).toHaveLength(MAX_COMPLEMENTS)
  })

  it('is empty for an ingredient no recipe uses', () => {
    expect(complementsOf('lonely', recipes, items)).toEqual([])
  })

  it('skips ids that are not in the catalogue', () => {
    expect(
      ids(complementsOf('a', [recipe('x', 'a', 'ghost', 'b')], items))
    ).toEqual(['b'])
  })
})

describe('relationsOf: the same set of relations for every ingredient (#205)', () => {
  it('has a shop section, complements, the recipes that use it and suggestions', () => {
    const relations = relationsOf(A, recipes, items, prices)
    expect(relations.section).toBe('Fruit & Veg')
    expect(ids(relations.complements)).toEqual(['b', 'c', 'd', 'e', 'f'])
    expect(ids(relations.recipes)).toEqual(['r1', 'r2', 'r3', 'r4'])
    expect(relations.suggestions).toHaveLength(3)
    expect(relations.suggestions[0]?.missing.map((m) => m.id)).toEqual([
      'b',
      'c'
    ])
  })

  it('still has every relation, just empty, for an ingredient no recipe uses', () => {
    const relations = relationsOf(LONELY, recipes, items, prices)
    expect(Object.keys(relations).sort()).toEqual([
      'complements',
      'recipes',
      'section',
      'suggestions'
    ])
    expect(relations.complements).toEqual([])
    expect(relations.recipes).toEqual([])
    expect(relations.suggestions).toEqual([])
  })
})

describe('the bundled catalogue (#205)', () => {
  it('gives every one of the catalogue ingredients the same four relations', () => {
    expect(catalogue.length).toBeGreaterThan(100)
    catalogue.forEach((ingredient) => {
      const relations = bundledRelations(ingredient)
      expect(typeof relations.section).toBe('string')
      expect(relations.complements.length).toBeLessThanOrEqual(MAX_COMPLEMENTS)
      expect(relations.suggestions.length).toBe(
        Math.min(3, relations.recipes.length)
      )
    })
  })

  it('pairs carrot with ingredients it is cooked with', () => {
    const names = catalogue
      .filter((i) => i.id === 'carrot')
      .flatMap((carrot) => bundledRelations(carrot).complements)
      .map((c) => c.name)
    expect(names.length).toBeGreaterThan(0)
  })
})
