import { renderHook } from '@testing-library/react'
import { library } from '../../library/recipeLibrary'
import { libRecipe } from '../../../test/fixtures'
import type { ListView } from '../personal'
import {
  NO_PERSONAL,
  behaviourOf,
  personalOf,
  signalsOf,
  usePersonal
} from '../personal'
import { NO_SETTINGS, SETTINGS_KEY } from '../settings'
import { affinity } from '../taste'

const recipe = libRecipe({
  id: 'x',
  name: 'X',
  ingredients: [{ ingredientId: 'beef-mince', quantity: 1, measure: 'g' }]
})
const behaviour = {
  picked: [recipe],
  extraIds: ['carrot'],
  crossedIds: ['carrot', 'beef-mince'],
  kept: [recipe]
}

describe('personal profile (#224)', () => {
  beforeEach(() => localStorage.clear())

  it('counts what the user selected, added, bought and kept, each by its weight', () => {
    const weights = signalsOf(behaviour).map((s) => [s.ingredientId, s.weight])
    expect(weights).toEqual([
      ['beef-mince', 1],
      ['carrot', 2],
      ['carrot', 1],
      ['beef-mince', 1],
      ['beef-mince', 2]
    ])
  })

  it('has no history and no locks to begin with', () => {
    expect(personalOf(signalsOnly(), NO_SETTINGS).taste.weights.size).toBe(0)
    expect(NO_PERSONAL.locks).toEqual({ allergens: [], diet: 'none' })
  })

  it('lays explicit settings over behaviour, and carries the locks', () => {
    const personal = personalOf(behaviour, {
      likes: ['rice'],
      dislikes: ['beef'],
      allergens: ['milk'],
      diet: 'vegetarian'
    })
    expect(affinity(personal.taste, 'beef')).toBeLessThan(0)
    expect(affinity(personal.taste, 'rice')).toBeGreaterThan(1)
    expect(personal.locks).toEqual({ allergens: ['milk'], diet: 'vegetarian' })
  })

  it('reads behaviour from the list and the hearted recipes', () => {
    const first = library[0]
    if (first === undefined) throw new Error('no library')
    const list = {
      entries: [{ recipe: first }],
      chips: [
        { id: 'carrot', extra: 1, crossed: true },
        { id: 'beef-mince', extra: null, crossed: false }
      ]
    }
    const result = behaviourOf(list, new Set([first.id]))
    expect(result.picked).toEqual([first])
    expect(result.extraIds).toEqual(['carrot'])
    expect(result.crossedIds).toEqual(['carrot'])
    expect(result.kept).toEqual([first])
  })

  it('reads the list once per load, but hearts as they arrive', () => {
    const [first, second] = library
    if (first === undefined || second === undefined)
      throw new Error('no library')
    const empty: ListView = { entries: [], chips: [] }
    const { result, rerender } = renderHook(
      ({ list, ids }) => usePersonal(list, ids),
      { initialProps: { list: empty, ids: new Set<string>() } }
    )
    expect(result.current.taste.weights.size).toBe(0)
    rerender({
      list: { entries: [{ recipe: first }], chips: [] },
      ids: new Set<string>()
    })
    expect(result.current.taste.weights.size).toBe(0)
    rerender({ list: empty, ids: new Set([second.id]) })
    expect(result.current.taste.weights.size).toBeGreaterThan(0)
  })

  it('reads the stored settings in the hook', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ diet: 'vegan' }))
    const { result } = renderHook(() =>
      usePersonal({ entries: [], chips: [] }, new Set())
    )
    expect(result.current.locks.diet).toBe('vegan')
  })
})

function signalsOnly() {
  return { picked: [], extraIds: [], crossedIds: [], kept: [] }
}
