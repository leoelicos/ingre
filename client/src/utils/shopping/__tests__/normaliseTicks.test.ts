import { act, renderHook } from '@testing-library/react'
import { BASKET_KEY, HAVE_KEY, PICKED_KEY } from '../../storage/shoppingState'
import { normaliseTicks, sameTicks } from '../normaliseTicks'
import { useShoppingList } from '../useShoppingList'

const ticks = (have: string[], basket: string[]) => ({
  haveIds: new Set(have),
  basketIds: new Set(basket)
})

describe('normaliseTicks', () => {
  const list = new Set(['beef-mince', 'onion', 'garlic'])

  it('have at home wins over in basket', () => {
    const clean = normaliseTicks(list, ticks(['onion'], ['onion', 'garlic']))
    expect([...clean.haveIds]).toEqual(['onion'])
    expect([...clean.basketIds]).toEqual(['garlic'])
  })

  it('drops ticks for items no longer on the list', () => {
    const clean = normaliseTicks(
      list,
      ticks(['salt', 'onion'], ['old-id', 'beef-mince'])
    )
    expect([...clean.haveIds]).toEqual(['onion'])
    expect([...clean.basketIds]).toEqual(['beef-mince'])
  })

  it('leaves consistent ticks alone (in basket, not at home, is valid)', () => {
    const saved = ticks([], ['beef-mince'])
    expect(sameTicks(saved, normaliseTicks(list, saved))).toBe(true)
    expect(sameTicks(saved, ticks([], []))).toBe(false)
    expect(sameTicks(saved, ticks(['x'], ['beef-mince']))).toBe(false)
  })
})

describe('useShoppingList load', () => {
  beforeEach(() => localStorage.clear())

  it('cleans saved ticks once on load', () => {
    localStorage.setItem(PICKED_KEY, '["dahl"]')
    localStorage.setItem(HAVE_KEY, '["onion","salt"]')
    localStorage.setItem(BASKET_KEY, '["onion","garlic","gone"]')
    const { result } = renderHook(() => useShoppingList())
    expect([...result.current.haveIds]).toEqual(['onion'])
    expect([...result.current.basketIds]).toEqual(['garlic'])
    expect(localStorage.getItem(BASKET_KEY)).toBe('["garlic"]')
    act(() => result.current.toggleBasket('onion'))
    expect(result.current.basketIds.has('onion')).toBe(true)
  })
})
