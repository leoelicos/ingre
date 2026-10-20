import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import {
  BASKET_KEY,
  PICKED_KEY,
  STEP_KEY
} from '../../../utils/storage/shoppingState'
import { ShoppingFlow } from '../ShoppingFlow'
import { TICK_DELAY_MS } from '../../../utils/shopping/usePendingTicks'

addFontAwesome()

/** At the shop with two recipes picked: plenty of rows to tick. */
const renderShop = () => {
  localStorage.setItem(PICKED_KEY, JSON.stringify(['butter-chicken', 'dahl']))
  localStorage.setItem(STEP_KEY, JSON.stringify('shop'))
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter>
        <AuthProvider>
          <StoreProvider>
            <ShoppingFlow />
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )
  return within(screen.getByRole('region', { name: 'At the shop' }))
}

/** A quick thumb: 150ms between taps, so 7 taps sit well inside the 2s pending window. */
const GAP_MS = 150
const pause = () => act(() => jest.advanceTimersByTime(GAP_MS))
const settle = () => act(() => jest.advanceTimersByTime(TICK_DELAY_MS + 500))

/** Every row's checkbox name, top to bottom, and how each row is built. */
const nameOf = (box: HTMLElement): string =>
  box.closest('li')?.querySelector('.list-row__name')?.textContent ?? ''
const rowNames = (p: ReturnType<typeof renderShop>) =>
  p.getAllByRole('checkbox').map(nameOf)
const rowShapes = () =>
  [...document.querySelectorAll('li.list-row')].map((li) => li.children.length)
const basket = (): string[] =>
  JSON.parse(localStorage.getItem(BASKET_KEY) ?? '[]')

beforeEach(() => {
  localStorage.clear()
  jest.useFakeTimers()
})
afterEach(() => jest.useRealTimers())

describe('quick successive ticks at the shop', () => {
  it('by name: 7 ticks inside the pending window all register and all reach the basket', () => {
    const p = renderShop()
    const names = p.getAllByRole('checkbox').slice(0, 7).map(nameOf)
    expect(names).toHaveLength(7)
    names.forEach((name) => {
      fireEvent.click(p.getByRole('checkbox', { name: new RegExp(`^${name}`) }))
      pause()
    })
    names.forEach((name) =>
      expect(
        p.getByRole('checkbox', { name: new RegExp(`^${name}`) })
      ).toBeChecked()
    )
    expect(p.getAllByRole('button', { name: /^Undo / })).toHaveLength(7)
    expect(basket()).toEqual([])
    settle()
    expect(basket()).toHaveLength(7)
    expect(p.getAllByRole('checkbox', { checked: true })).toHaveLength(7)
  })

  it('by position: the nth checkbox is the same row after every tick, and no row grows', () => {
    const p = renderShop()
    const order = rowNames(p)
    const shapes = rowShapes()
    for (let i = 0; i < 7; i++) {
      const box = p.getAllByRole('checkbox')[i]
      fireEvent.click(box ?? document.body)
      expect(box).toBeChecked()
      // nothing reorders, and no line is inserted under a pending row
      expect(rowNames(p)).toEqual(order)
      expect(rowShapes()).toEqual(shapes)
      pause()
    }
    p.getAllByRole('checkbox')
      .slice(0, 7)
      .forEach((b) => expect(b).toBeChecked())
    settle()
    expect(basket()).toHaveLength(7)
  })

  it('a pending row shows Undo in the Details slot, announces its status, and Undo returns focus', () => {
    const p = renderShop()
    const box = p.getAllByRole('checkbox')[0] ?? document.body
    const name = nameOf(box)
    const details = p.getAllByRole('button', { name: /^Details for/ }).length
    fireEvent.click(box)
    expect(p.getAllByRole('button', { name: /^Details for/ })).toHaveLength(
      details - 1
    )
    expect(p.getByText(/: In basket$/)).toHaveAttribute('role', 'status')
    expect(p.getByText('In basket')).toHaveAttribute('aria-hidden', 'true')
    // the source line stays in the checkbox's name while the overlay is drawn
    expect(box).toHaveAccessibleName(expect.stringMatching(/for /))
    fireEvent.click(
      p.getByRole('button', { name: new RegExp(`^Undo ${name}`, 'i') })
    )
    expect(box).not.toBeChecked()
    expect(box).toHaveFocus()
    expect(p.getAllByRole('button', { name: /^Details for/ })).toHaveLength(
      details
    )
    settle()
    expect(basket()).toEqual([])
  })
})
