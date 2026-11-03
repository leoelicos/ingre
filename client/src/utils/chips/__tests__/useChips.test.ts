import { act, renderHook } from '@testing-library/react'
import { itemById, recipeById } from '../../../test/library'
import { newCopy, withAmount, withPortions } from '../../balance/copies'
import {
  COPIES_KEY,
  CROSSED_KEY,
  EXTRAS_KEY,
  LAYOUT_KEY
} from '../../storage/shoppingState'
import type { Chip } from '../chips'
import type { RemovedCopy } from '../useChips'
import {
  addOnce,
  catalogueExtra,
  copyEntries,
  removedCopy,
  useChips,
  withCopyAt
} from '../useChips'

const stored = (key: string): unknown =>
  JSON.parse(localStorage.getItem(key) ?? 'null')

const ids = (chips: readonly { id: string }[]) => chips.map((c) => c.id)

const chicken = recipeById('butter-chicken')
const dahl = recipeById('dahl')
const pork = recipeById('pork-chops-apple-onion')

beforeEach(() => localStorage.clear())

describe('helpers', () => {
  it('finds a copy and its place, or null when it is not on the list (#192)', () => {
    const copies = [newCopy('dahl'), newCopy('butter-chicken')]
    expect(removedCopy(copies, 'butter-chicken')).toEqual({
      copy: copies[1],
      index: 1
    })
    expect(removedCopy(copies, 'nope')).toBeNull()
  })

  it('puts a copy back at its place, once (#192)', () => {
    const [first, second, third] = [
      newCopy('dahl'),
      newCopy('butter-chicken'),
      newCopy('pork-chops-apple-onion')
    ]
    const back = { copy: second, index: 1 }
    expect(withCopyAt([first, third], back)).toEqual([first, second, third])
    expect(withCopyAt([first, second], back)).toEqual([first, second])
  })

  it('skips unknown recipes and labels the copies', () => {
    const entries = copyEntries([newCopy('nope'), newCopy('dahl')])
    expect(entries.map((e) => e.label)).toEqual(['Red lentil dahl'])
  })

  it('adds an extra once', () => {
    const butter = catalogueExtra(itemById('butter'))
    expect(butter).toEqual({
      id: 'butter',
      name: 'butter',
      ingredientId: 'butter',
      quantity: 1
    })
    expect(addOnce([butter], { ...butter, quantity: 3 })).toEqual([butter])
  })
})

describe('useChips', () => {
  const chipOf = (chips: readonly Chip[], id: string) => {
    const found = chips.find((c) => c.id === id)
    if (found === undefined) throw new Error(`no chip ${id}`)
    return found
  }

  it('Scenario: Staples belong to their recipe: picked at 2 portions, nothing goes in Extra, and unpicking removes them', () => {
    const { result } = renderHook(() => useChips())
    act(() => result.current.togglePicked(pork))
    expect(stored(COPIES_KEY)).toEqual([newCopy(pork.id)])
    expect([...result.current.pickedIds]).toEqual([pork.id])
    expect(ids(result.current.extraChips)).toEqual([])
    expect(result.current.hasChip('salt')).toBe(true)
    expect(chipOf(result.current.chips, 'salt').sources).toEqual([
      expect.objectContaining({ kind: 'recipe', recipeId: pork.id })
    ])
    expect(result.current.hasChip('feta')).toBe(false)
    expect(stored(LAYOUT_KEY)).toMatchObject({
      placed: { butter: 'Dairy, Eggs & Fridge' }
    })
    act(() => result.current.togglePicked(pork))
    expect(stored(COPIES_KEY)).toEqual([])
    expect(ids(result.current.chips)).toEqual([])
  })

  it('sets amounts and portions per copy, and refresh resets them', () => {
    const { result } = renderHook(() => useChips())
    act(() => result.current.togglePicked(chicken))
    act(() => result.current.togglePicked(dahl))
    act(() => result.current.setAmount(chicken.id, 'butter', 37.5))
    act(() => result.current.setAmount('nope', 'butter', 1))
    act(() => result.current.setPortions(dahl.id, 4))
    expect(stored(COPIES_KEY)).toEqual([
      withAmount(newCopy(chicken.id), chicken, 'butter', 37.5),
      withPortions(newCopy(dahl.id), 4)
    ])
    expect(
      chipOf(result.current.chips, 'butter').sources.map((s) => s.quantity)
    ).toEqual([37.5, 30])
    expect(result.current.chipState.layout.order).toContain('butter')
    act(() => result.current.refresh())
    expect(stored(COPIES_KEY)).toEqual([newCopy(chicken.id), newCopy(dahl.id)])
  })

  it('crosses off, changes category, and only moves on sort', () => {
    const { result } = renderHook(() => useChips())
    act(() => result.current.togglePicked(dahl))
    act(() => result.current.toggleCrossed('tomato'))
    expect(stored(CROSSED_KEY)).toEqual(['tomato'])
    const before = ids(result.current.chips)
    act(() => result.current.setCategory('tomato', 'Dairy, Eggs & Fridge'))
    expect(chipOf(result.current.chips, 'tomato')).toMatchObject({
      section: 'Dairy, Eggs & Fridge',
      group: 'Fruit & Veg',
      crossed: true
    })
    expect(ids(result.current.chips)).toEqual(before)
    act(() => result.current.sort())
    expect(chipOf(result.current.chips, 'tomato').group).toBe(
      'Dairy, Eggs & Fridge'
    )
  })

  it('adds extras once at 1, sets them, and removing uncrosses only when no recipe needs it', () => {
    const { result } = renderHook(() => useChips())
    act(() => result.current.togglePicked(chicken))
    act(() => result.current.toggleCrossed('butter'))
    act(() => result.current.addExtra(itemById('butter')))
    expect(stored(CROSSED_KEY)).toEqual([])
    act(() => result.current.addExtra(itemById('butter')))
    act(() => result.current.setExtra('butter', 3))
    expect(stored(EXTRAS_KEY)).toEqual([
      { ...catalogueExtra(itemById('butter')), quantity: 3 }
    ])
    act(() => result.current.toggleCrossed('butter'))
    act(() => result.current.removeExtra('butter'))
    expect(stored(CROSSED_KEY)).toEqual(['butter'])
    act(() => result.current.addExtra(itemById('feta')))
    act(() => result.current.toggleCrossed('feta'))
    act(() => result.current.setExtra('other', 2))
    act(() => result.current.removeExtra('feta'))
    expect(stored(CROSSED_KEY)).toEqual(['butter'])
    expect(stored(EXTRAS_KEY)).toEqual([])
    expect(ids(result.current.extraGroups.flatMap((g) => g.chips))).toEqual([])
  })

  it('Scenario: State kept on refresh', () => {
    const first = renderHook(() => useChips())
    act(() => first.result.current.togglePicked(dahl))
    act(() => first.result.current.addExtra(itemById('feta')))
    act(() => first.result.current.toggleCrossed('tomato'))
    const order = ids(first.result.current.chips)
    first.unmount()
    const again = renderHook(() => useChips()).result.current
    expect(ids(again.chips)).toEqual(order)
    expect(chipOf(again.chips, 'tomato').crossed).toBe(true)
  })
})

describe('removing with undo (#192)', () => {
  it('removes a picked copy and restores it; an unpicked one gives null', () => {
    localStorage.setItem(
      COPIES_KEY,
      JSON.stringify([newCopy('dahl'), newCopy('butter-chicken')])
    )
    const { result } = renderHook(() => useChips())
    const gone: (RemovedCopy | null)[] = []
    act(() => {
      gone.push(result.current.removePicked('nope'))
      gone.push(result.current.removePicked('dahl'))
    })
    expect([...result.current.pickedIds]).toEqual(['butter-chicken'])
    const [none, removed] = gone
    expect(none).toBeNull()
    if (removed === null || removed === undefined)
      throw new Error('nothing removed')
    act(() => result.current.restore(removed))
    expect([...result.current.pickedIds]).toEqual(['dahl', 'butter-chicken'])
  })
})
