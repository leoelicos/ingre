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
import {
  addOnce,
  catalogueExtra,
  copyEntries,
  stapleExtras,
  useChips
} from '../useChips'

const stored = (key: string): unknown =>
  JSON.parse(localStorage.getItem(key) ?? 'null')

const ids = (chips: readonly { id: string }[]) => chips.map((c) => c.id)

const chicken = recipeById('butter-chicken')
const dahl = recipeById('dahl')
const pork = recipeById('pork-chops-apple-onion')

beforeEach(() => localStorage.clear())

describe('helpers', () => {
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

  it('Scenario: Staples go in Extra, rounded up to whole units (F1)', () => {
    const staples = stapleExtras(pork, newCopy(pork.id))
    expect(staples.map((e) => [e.id, e.quantity])).toEqual([
      ['olive-oil', 20],
      ['salt', 3],
      ['black-pepper', 3]
    ])
    expect(stapleExtras(pork, newCopy(pork.id), [])).toEqual([])
  })
})

describe('useChips', () => {
  const chipOf = (chips: readonly Chip[], id: string) => {
    const found = chips.find((c) => c.id === id)
    if (found === undefined) throw new Error(`no chip ${id}`)
    return found
  }

  it('picks a copy at 2 portions with its staples in Extra; unpicking removes the copy only', () => {
    const { result } = renderHook(() => useChips())
    act(() => result.current.togglePicked(pork))
    expect(stored(COPIES_KEY)).toEqual([newCopy(pork.id)])
    expect([...result.current.pickedIds]).toEqual([pork.id])
    expect(ids(result.current.extraChips)).toEqual([
      'olive-oil',
      'salt',
      'black-pepper'
    ])
    expect(result.current.hasChip('salt')).toBe(true)
    expect(result.current.hasChip('feta')).toBe(false)
    expect(stored(LAYOUT_KEY)).toMatchObject({
      placed: { butter: 'Dairy, Eggs & Fridge' }
    })
    act(() => result.current.togglePicked(pork))
    expect(stored(COPIES_KEY)).toEqual([])
    expect(ids(result.current.chips)).toEqual([
      'olive-oil',
      'salt',
      'black-pepper'
    ])
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
