import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { libIngredient } from '../../../test/fixtures'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import {
  EXTRAS_KEY,
  HAVE_KEY,
  PICKED_KEY,
  STEP_KEY
} from '../../../utils/storage/shoppingState'
import type { ShopLine } from '../../../utils/shopping/shoppingList'
import type { ShopSection } from '../../../utils/shopping/sections'
import { ShoppingFlow } from '../ShoppingFlow'
import {
  catalogueItemFor,
  chipOrder,
  itemCount,
  lineBadge
} from '../ShoppingChips'
import { stillNeeded } from '../ShoppingListView'

addFontAwesome()

const renderFlow = (picked: string[], step: string) => {
  localStorage.setItem(PICKED_KEY, JSON.stringify(picked))
  localStorage.setItem(STEP_KEY, JSON.stringify(step))
  return render(
    <MockedProvider mocks={[]}>
      <MemoryRouter>
        <AuthProvider>
          <ShoppingFlow />
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )
}

const chipList = () => screen.getByRole('list', { name: /^Shopping list, / })
const chipNames = () =>
  within(chipList())
    .getAllByRole('listitem')
    .map((chip) => chip.textContent)

const shopLine = (name: string, section: ShopSection): ShopLine => ({
  ingredientId: name,
  name,
  section,
  subsection: null,
  location: null,
  staple: false,
  need: { amount: 1, unit: 'count' },
  buy: { kind: 'count', count: 1 },
  recipes: [],
  parts: [],
  extraQuantity: null
})

beforeEach(() => {
  localStorage.clear()
  jest.useFakeTimers()
})
afterEach(() => jest.useRealTimers())

describe('Shopping list chips (#159)', () => {
  it('is (Pick − At home) + extras: A, C and D', () => {
    // fried rice needs eggs, carrot, rice...; eggs are at home; banana is an extra
    localStorage.setItem(HAVE_KEY, '["egg"]')
    localStorage.setItem(
      EXTRAS_KEY,
      '[{"id":"banana","name":"banana","ingredientId":"banana","quantity":1}]'
    )
    renderFlow(['egg-fried-rice'], 'home')
    const names = chipNames()
    expect(names.some((n) => /Eggs?$/.test(n ?? ''))).toBe(false)
    expect(names.some((n) => /Carrot$/.test(n ?? ''))).toBe(true)
    expect(names.some((n) => /Banana$/.test(n ?? ''))).toBe(true)
  })

  it('updates live: an item marked at home leaves the chips at once', () => {
    renderFlow(['egg-fried-rice'], 'home')
    const before = chipNames().length
    const carrot = screen.getByRole('checkbox', { name: /carrot/i })
    fireEvent.click(carrot)
    expect(chipNames()).toHaveLength(before - 1)
    expect(chipNames().some((n) => /Carrot$/.test(n ?? ''))).toBe(false)
    act(() => jest.advanceTimersByTime(2500))
    expect(chipNames()).toHaveLength(before - 1)
  })

  it('VoiceOver: a named list with the count, each chip the full name (badge hidden)', () => {
    renderFlow(['dahl'], 'shop')
    const list = chipList()
    const chips = within(list).getAllByRole('listitem')
    expect(list).toHaveAccessibleName(
      `Shopping list, ${itemCount(chips.length)}`
    )
    chips.forEach((chip) => {
      const badge = chip.querySelector('[aria-hidden="true"]')
      expect(badge).not.toBeNull()
      expect(chip.textContent?.startsWith(badge?.textContent ?? '')).toBe(true)
    })
    expect(
      screen.getByRole('region', { name: /^Shopping list/ })
    ).toBeInTheDocument()
  })

  it('shows the count heading with no chips when everything is at home', () => {
    renderFlow(['dahl'], 'home')
    screen.getAllByRole('checkbox').forEach((box) => fireEvent.click(box))
    expect(
      screen.getByRole('heading', { name: 'Shopping list 0 items' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: /^Shopping list, / })).toBeNull()
  })

  it('counts items in words', () => {
    expect(itemCount(1)).toBe('1 item')
    expect(itemCount(3)).toBe('3 items')
  })

  it('finds the catalogue item behind recipe lines and catalogue extras; free text has none', () => {
    const items = [libIngredient({ id: 'onion', badgeCode: 'ONI' })]
    expect(catalogueItemFor('onion', items)?.id).toBe('onion')
    expect(catalogueItemFor('extra:onion', items)?.id).toBe('onion')
    expect(catalogueItemFor('extra:free-candles', items)).toBeNull()
    expect(
      lineBadge({ ingredientId: 'extra:onion', name: 'x' }, items)
    ).toEqual({
      name: 'brown onion',
      category: 'fruit & veg',
      badgeCode: 'ONI'
    })
    expect(
      lineBadge({ ingredientId: 'extra:free-candles', name: 'candles' }, items)
    ).toEqual({ name: 'candles', category: '' })
    expect(
      lineBadge({ ingredientId: 'onion', name: 'x' }, [libIngredient()])
    ).toEqual({ name: 'brown onion', category: 'fruit & veg' })
  })

  it('orders chips by shop section and drops anything just ticked at home', () => {
    const lines = [shopLine('a', 'Other'), shopLine('b', 'Fruit & Veg')]
    expect(chipOrder(lines).map((l) => l.name)).toEqual(['b', 'a'])
    expect(stillNeeded(lines, new Set(['a'])).map((l) => l.name)).toEqual(['b'])
  })
})
