import { act, renderHook } from '@testing-library/react'
import { catalogue } from '../../library/recipeLibrary'
import {
  CROSSED_KEY,
  EDITS_KEY,
  EXTRAS_KEY,
  LAYOUT_KEY,
  PICKED_KEY
} from '../../storage/shoppingState'
import {
  addOnce,
  catalogueExtra,
  chipLines,
  useChips,
  withEdit,
  withoutEdit
} from '../useChips'

const stored = (key: string): unknown =>
  JSON.parse(localStorage.getItem(key) ?? 'null')

const item = (id: string) => {
  const found = catalogue.find((i) => i.id === id)
  if (found === undefined) throw new Error(`no ${id}`)
  return found
}

const ids = (chips: readonly { id: string }[]) => chips.map((c) => c.id)

describe('chip lines', () => {
  it('leaves out staples and extras a recipe already needs', () => {
    const empty = renderHook(() => useChips()).result.current
    expect(empty.chips).toEqual([])
    const lines = chipLines([], 2, [
      catalogueExtra(item('butter')),
      catalogueExtra(item('salt'))
    ])
    expect(lines.map((l) => l.name)).toEqual(['butter', 'salt'])
  })

  it('adds an extra once, and edits one chip at a time', () => {
    const butter = catalogueExtra(item('butter'))
    expect(butter).toEqual({
      id: 'butter',
      name: 'butter',
      ingredientId: 'butter',
      quantity: 1
    })
    expect(addOnce([butter], butter)).toEqual([butter])
    expect(withEdit({}, 'a', { quantity: 2 })).toEqual({
      a: { quantity: 2, section: null }
    })
    expect(
      withoutEdit(
        {
          a: { quantity: 2, section: null },
          b: { quantity: 1, section: null }
        },
        'a'
      )
    ).toEqual({ b: { quantity: 1, section: null } })
  })
})

describe('useChips', () => {
  beforeEach(() => localStorage.clear())

  it('builds chips from picked recipes, placed once and kept on the device', () => {
    const { result } = renderHook(() => useChips())
    act(() => result.current.togglePicked('dahl'))
    expect(stored(PICKED_KEY)).toEqual(['dahl'])
    expect(result.current.recipes.map((r) => r.id)).toEqual(['dahl'])
    expect(ids(result.current.chips)).toContain('butter')
    expect(result.current.hasChip('butter')).toBe(true)
    expect(result.current.hasChip('feta')).toBe(false)
    const layout = stored(LAYOUT_KEY)
    expect(layout).toMatchObject({ placed: { butter: 'Dairy, Eggs & Fridge' } })
    expect(result.current.groups.map((g) => g.section)).toEqual([
      'Fruit & Veg',
      'Dairy, Eggs & Fridge',
      'Pantry'
    ])
  })

  it('crosses off, edits quantity and category, and only moves on sort', () => {
    const { result } = renderHook(() => useChips())
    act(() => result.current.togglePicked('dahl'))
    act(() => result.current.toggleCrossed('tomato'))
    expect(stored(CROSSED_KEY)).toEqual(['tomato'])
    act(() => result.current.setQuantity('tomato', 2))
    expect(stored(EDITS_KEY)).toEqual({
      tomato: { quantity: 2, section: null }
    })
    const before = ids(result.current.chips)
    act(() => result.current.setCategory('tomato', 'Dairy, Eggs & Fridge'))
    const tomato = () => result.current.chips.find((c) => c.id === 'tomato')
    expect(tomato()).toMatchObject({
      section: 'Dairy, Eggs & Fridge',
      group: 'Fruit & Veg',
      quantity: 2,
      crossed: true
    })
    expect(ids(result.current.chips)).toEqual(before)
    act(() => result.current.sort())
    expect(tomato()?.group).toBe('Dairy, Eggs & Fridge')
  })

  it('adds and removes extras, clearing their crossed off state and edits', () => {
    const { result } = renderHook(() => useChips())
    act(() => result.current.addExtra(item('feta')))
    act(() => result.current.addExtra(item('feta')))
    expect(stored(EXTRAS_KEY)).toHaveLength(1)
    expect(result.current.chips[0]).toMatchObject({ id: 'feta', extra: true })
    act(() => result.current.toggleCrossed('feta'))
    act(() => result.current.setQuantity('feta', 3))
    act(() => result.current.removeExtra('feta'))
    expect(result.current.chips).toEqual([])
    expect(stored(EXTRAS_KEY)).toEqual([])
    expect(stored(CROSSED_KEY)).toEqual([])
    expect(stored(EDITS_KEY)).toEqual({})
  })

  it('keeps everything after a reload', () => {
    const first = renderHook(() => useChips())
    act(() => first.result.current.togglePicked('dahl'))
    act(() => first.result.current.addExtra(item('feta')))
    act(() => first.result.current.toggleCrossed('tomato'))
    const order = ids(first.result.current.chips)
    first.unmount()
    const again = renderHook(() => useChips()).result.current
    expect(ids(again.chips)).toEqual(order)
    expect(again.chips.find((c) => c.id === 'tomato')?.crossed).toBe(true)
  })
})
