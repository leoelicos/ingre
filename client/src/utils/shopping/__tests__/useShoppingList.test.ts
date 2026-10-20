import { act, renderHook } from '@testing-library/react'
import { HAVE_KEY, PICKED_KEY } from '../../storage/shoppingState'
import type { ListSnapshot } from '../useShoppingList'
import {
  EMPTY_LIST,
  NO_UNSAVED,
  addExtra,
  extraId,
  sameList,
  withUnsaved,
  setExtraQuantity,
  useShoppingList
} from '../useShoppingList'

describe('extras', () => {
  const milk = { name: 'full cream milk', ingredientId: 'full-cream-milk' }
  it('ids by catalogue id or slugged free text', () => {
    expect(extraId(milk)).toBe('full-cream-milk')
    expect(extraId({ name: ' Birthday Candles! ', ingredientId: null })).toBe(
      'free-birthday-candles-'
    )
  })
  it('adds once, then bumps the quantity', () => {
    const once = addExtra([], milk)
    expect(once).toEqual([
      {
        id: 'full-cream-milk',
        name: 'full cream milk',
        ingredientId: 'full-cream-milk',
        quantity: 1
      }
    ])
    expect(addExtra(once, milk)[0]?.quantity).toBe(2)
    expect(addExtra(once, { name: 'x', ingredientId: null })).toHaveLength(2)
  })
  it('sets quantity by line id; 0 removes', () => {
    const list = addExtra(addExtra([], milk), { name: 'x', ingredientId: null })
    expect(
      setExtraQuantity(list, 'extra:full-cream-milk', 3)[0]?.quantity
    ).toBe(3)
    expect(setExtraQuantity(list, 'extra:full-cream-milk', 0)).toHaveLength(1)
  })
})

describe('useShoppingList', () => {
  beforeEach(() => localStorage.clear())

  it('builds lines from picked recipes; staples are assumed, not listed', () => {
    const { result } = renderHook(() => useShoppingList())
    expect(result.current.lineCount).toBe(0)
    act(() => result.current.togglePicked('dahl'))
    expect(result.current.recipes.map((r) => r.id)).toEqual(['dahl'])
    expect(result.current.alreadyHave).toEqual([])
    expect(result.current.assumed).toBe('oil, salt, pepper')
    expect(result.current.toBuy.some((l) => l.staple)).toBe(false)
    const first = result.current.toBuy[0]
    act(() => result.current.toggleHave(first?.ingredientId ?? ''))
    expect(result.current.alreadyHave.map((l) => l.ingredientId)).toContain(
      first?.ingredientId
    )
  })

  it('applies people and location overrides', () => {
    localStorage.setItem(PICKED_KEY, JSON.stringify(['dahl']))
    const { result } = renderHook(() => useShoppingList())
    const id = result.current.toBuy[0]?.ingredientId ?? ''
    act(() => result.current.setLocation(id, 'Bench'))
    expect(result.current.toBuy[0]?.location).toBe('Bench')
    const before = result.current.toBuy[0]?.need.amount ?? 0
    act(() => result.current.setPeople(1))
    expect(result.current.toBuy[0]?.need.amount).toBe(before / 2)
  })

  it('adds extras unticked and adjusts their quantity', () => {
    localStorage.setItem(HAVE_KEY, JSON.stringify(['extra:free-candles']))
    const { result } = renderHook(() => useShoppingList())
    act(() => result.current.toggleBasket('extra:free-candles'))
    act(() => result.current.addExtra({ name: 'candles', ingredientId: null }))
    const line = result.current.toBuy.find(
      (l) => l.ingredientId === 'extra:free-candles'
    )
    expect(line?.section).toBe('Other')
    expect(result.current.basketIds.has('extra:free-candles')).toBe(false)
    act(() => result.current.setExtraQuantity('extra:free-candles', 4))
    expect(result.current.toBuy[0]?.extraQuantity).toBe(4)
  })
})

describe('list snapshots', () => {
  const extra = { id: 'free-x', name: 'x', ingredientId: null, quantity: 1 }
  const full: ListSnapshot = {
    pickedIds: new Set(['dahl']),
    haveIds: new Set(['onion']),
    basketIds: new Set(['garlic']),
    extras: [extra],
    step: 'shop'
  }

  it('sameList compares picks, ticks, extras (field by field) and step by value', () => {
    expect(sameList(full, { ...full, pickedIds: new Set(['dahl']) })).toBe(true)
    expect(sameList(full, { ...full, extras: [{ ...extra }] })).toBe(true)
    expect(sameList(full, EMPTY_LIST)).toBe(false)
    expect(sameList(full, { ...full, step: 'home' })).toBe(false)
    expect(sameList(full, { ...full, pickedIds: new Set(['x']) })).toBe(false)
    expect(sameList(full, { ...full, haveIds: new Set() })).toBe(false)
    expect(sameList(full, { ...full, basketIds: new Set() })).toBe(false)
    expect(sameList(full, { ...full, extras: [] })).toBe(false)
    expect(sameList(full, { ...full, extras: [{ ...extra, id: 'y' }] })).toBe(
      false
    )
    expect(sameList(full, { ...full, extras: [{ ...extra, name: 'y' }] })).toBe(
      false
    )
    expect(
      sameList(full, { ...full, extras: [{ ...extra, ingredientId: 'y' }] })
    ).toBe(false)
    expect(
      sameList(full, { ...full, extras: [{ ...extra, quantity: 2 }] })
    ).toBe(false)
  })

  it('withUnsaved saves waiting ticks into the snapshot, leaving the rest alone', () => {
    expect(withUnsaved(full, NO_UNSAVED)).toEqual(full)
    expect(
      withUnsaved(full, { haveIds: ['egg'], basketIds: ['milk'] })
    ).toEqual({
      ...full,
      haveIds: new Set(['onion', 'egg']),
      basketIds: new Set(['garlic', 'milk'])
    })
  })
})
