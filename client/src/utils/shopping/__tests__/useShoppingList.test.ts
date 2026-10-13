import { act, renderHook } from '@testing-library/react'
import { libIngredient, recipe } from '../../../test/fixtures'
import { catalogue, library } from '../../library/recipeLibrary'
import { savedToLibrary, stapleIds, useShoppingList } from '../useShoppingList'

describe('savedToLibrary', () => {
  it('resolves saved recipes by library id and skips unknown ones', () => {
    const saved = [
      recipe({ libraryId: 'dahl' }),
      recipe({ libraryId: 'gone' }),
      recipe({ libraryId: 'butter-chicken' })
    ]
    expect(savedToLibrary(saved).map((r) => r.id)).toEqual([
      'dahl',
      'butter-chicken'
    ])
  })
})

describe('stapleIds', () => {
  it('collects staple ingredient ids', () => {
    const items = [libIngredient(), libIngredient({ id: 'salt', staple: true })]
    expect([...stapleIds(items)]).toEqual(['salt'])
  })
})

describe('useShoppingList', () => {
  beforeEach(() => localStorage.clear())

  it('starts staples in already-have and moves ticked items', () => {
    const recipes = library.filter((r) => r.id === 'dahl')
    const { result } = renderHook(() => useShoppingList(recipes))
    const staples = stapleIds(catalogue)
    expect(
      result.current.alreadyHave.every((l) => staples.has(l.ingredientId))
    ).toBe(true)
    const first = result.current.toBuy[0]
    expect(first).toBeDefined()
    act(() => result.current.toggleHave(first?.ingredientId ?? ''))
    expect(result.current.alreadyHave.map((l) => l.ingredientId)).toContain(
      first?.ingredientId
    )
  })

  it('applies people and location overrides', () => {
    const recipes = library.filter((r) => r.id === 'dahl')
    const { result } = renderHook(() => useShoppingList(recipes))
    const id = result.current.toBuy[0]?.ingredientId ?? ''
    act(() => result.current.setLocation(id, 'Bench'))
    expect(result.current.toBuy[0]?.location).toBe('Bench')
    const before = result.current.toBuy[0]?.need.amount ?? 0
    act(() => result.current.setPeople(1))
    expect(result.current.toBuy[0]?.need.amount).toBe(before / 2)
  })
})
