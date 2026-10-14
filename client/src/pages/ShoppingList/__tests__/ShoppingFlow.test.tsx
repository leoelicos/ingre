import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import { PICKED_KEY, STEP_KEY } from '../../../utils/storage/shoppingState'
import TapOff from '../../TapOff/TapOff'
import { recipeCount } from '../PickStep'
import { ShoppingFlow } from '../ShoppingFlow'
import { assumedNames, tapLabel } from '../ShoppingListView'

const renderFlow = (picked: string[] = [], step = 'pick') => {
  localStorage.setItem(PICKED_KEY, JSON.stringify(picked))
  localStorage.setItem(STEP_KEY, JSON.stringify(step))
  return render(
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
}

/** Lets the shared tick clock run out and the fade finish. */
const settle = () => act(() => jest.advanceTimersByTime(2500))

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

const tab = (name: string) => screen.getByRole('tab', { name })
const panel = () => screen.getByRole('tabpanel')
const tapCount = () =>
  Number(
    screen
      .getByRole('button', { name: /^Tap \d+ items?$/ })
      .textContent?.match(/\d+/)?.[0]
  )

describe('labels', () => {
  it('pluralises', () => {
    expect(tapLabel(1)).toBe('Tap 1 item')
    expect(
      assumedNames([
        { name: 'olive oil' },
        { name: 'sesame oil' },
        { name: 'Salt' },
        { name: 'black pepper' }
      ])
    ).toBe('oil, salt, pepper')
    expect(tapLabel(3)).toBe('Tap 3 items')
    expect(recipeCount(1)).toBe('1 recipe')
    expect(recipeCount(3)).toBe('3 recipes')
  })
})

describe('ShoppingFlow', () => {
  beforeEach(() => localStorage.clear())

  it('picks recipes without logging in, then moves on only when asked', () => {
    renderFlow()
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('0 recipes')).toBeInTheDocument()
    const add = screen.getByRole('button', { name: '+ Add Red lentil dahl' })
    fireEvent.click(add)
    expect(add).toHaveAttribute('aria-pressed', 'true')
    expect(add).toHaveTextContent('✓ Added')
    expect(screen.getByText('1 recipe')).toBeInTheDocument()
    expect(localStorage.getItem(PICKED_KEY)).toBe('["dahl"]')
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(
      screen.getByRole('button', {
        name: /^Next: check at home \(\d+\)$/
      })
    )
    expect(tab('At home')).toHaveAttribute('aria-selected', 'true')
    expect(localStorage.getItem(STEP_KEY)).toBe('"home"')
    expect(
      within(panel()).getByRole('heading', { name: 'Check your kitchen' })
    ).toBeInTheDocument()
  })

  it('reopens on the last step and switches with tabs and arrow keys', () => {
    renderFlow(['dahl'], 'shop')
    expect(tab('At the shop')).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(tab('At the shop'), { key: 'ArrowRight' })
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Pick')).toHaveFocus()
    fireEvent.keyDown(tab('Pick'), { key: 'ArrowLeft' })
    expect(tab('At the shop')).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(tab('At the shop'), { key: 'Enter' })
    expect(tab('At the shop')).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(tab('At home'))
    expect(tab('At home')).toHaveAttribute('aria-selected', 'true')
  })

  it('swipes past 40% of the width, snaps back otherwise, ignores vertical scrolls', () => {
    renderFlow(['dahl'], 'home')
    const viewport =
      screen.getByRole('tabpanel').parentElement?.parentElement ?? document.body
    Object.defineProperty(viewport, 'clientWidth', { value: 400 })
    const swipe = (from: number, to: number, dy = 0) => {
      fireEvent.touchStart(viewport, {
        touches: [{ clientX: from, clientY: 100 }]
      })
      fireEvent.touchMove(viewport, {
        touches: [{ clientX: to, clientY: 100 + dy }]
      })
      expect(screen.getAllByRole('tabpanel').length > 1).toBe(dy === 0)
      fireEvent.touchMove(viewport, {
        touches: [{ clientX: to, clientY: 100 + dy }]
      })
      fireEvent.touchEnd(viewport)
    }
    swipe(300, 200)
    expect(tab('At home')).toHaveAttribute('aria-selected', 'true')
    swipe(300, 100)
    expect(tab('At the shop')).toHaveAttribute('aria-selected', 'true')
    swipe(100, 300, 400)
    expect(tab('At the shop')).toHaveAttribute('aria-selected', 'true')
    swipe(100, 300)
    expect(tab('At home')).toHaveAttribute('aria-selected', 'true')
    swipe(100, 350)
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
    swipe(100, 350)
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
    swipe(350, 100)
    expect(tab('At home')).toHaveAttribute('aria-selected', 'true')
    fireEvent.touchStart(viewport, { touches: [] })
    fireEvent.touchMove(viewport, { touches: [] })
    fireEvent.touchEnd(viewport)
    fireEvent.touchStart(viewport, { touches: [{ clientX: 1, clientY: 1 }] })
    fireEvent.touchCancel(viewport)
    fireEvent.touchMove(viewport, { touches: [{ clientX: 300, clientY: 1 }] })
    expect(tab('At home')).toHaveAttribute('aria-selected', 'true')
  })

  it('at home: ticking moves items to Already have; Move to; breakdown; people', () => {
    renderFlow(['butter-chicken', 'dahl'], 'home')
    const p = within(panel())
    expect(p.getByText('Tick what you already have')).toBeInTheDocument()
    expect(
      p.getAllByText('for butter chicken and red lentil dahl').length
    ).toBeGreaterThan(0)
    const onion = p.getAllByRole('checkbox', { name: /Brown onion/ })[0]
    fireEvent.click(onion ?? document.body)
    expect(p.getByText(/^Moved to Already have/)).toBeInTheDocument()
    expect(p.queryByRole('button', { name: /Already have/ })).toBeNull()
    act(() => jest.advanceTimersByTime(2000))
    expect(onion?.closest('li')).toHaveClass('list-row--leaving')
    settle()
    const have = p.getByRole('button', { name: /Already have/ })
    expect(have).toHaveTextContent('Already have (1)')
    expect(have).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(have)
    expect(have).toHaveAttribute('aria-expanded', 'true')
    expect(
      document.getElementById(have.getAttribute('aria-controls') ?? '')
    ).not.toBeNull()
    expect(p.getByText(/^Assumed at home: /)).toHaveTextContent(
      /oil, salt|salt/
    )
    expect(
      p.getAllByRole('checkbox', { name: /Brown onion/, checked: true })
    ).toHaveLength(1)

    fireEvent.click(
      p.getAllByRole('button', { name: /^Details for/ })[0] ?? document.body
    )
    expect(p.queryByText(/in total$/)).not.toBeInTheDocument()
    const move = within(p.getByRole('group', { name: /^Move .* to$/ }))
    expect(move.getAllByRole('button', { pressed: true })).toHaveLength(1)
    fireEvent.click(move.getByRole('button', { name: 'Bench' }))
    expect(p.getAllByRole('region', { name: 'Bench' }).length).toBeGreaterThan(
      0
    )

    fireEvent.click(p.getByRole('button', { name: 'Details for ginger' }))
    expect(p.getByText(/^Butter chicken: /)).toBeInTheDocument()
    const total = p.getByText(/in total$/).textContent
    fireEvent.click(p.getByRole('radio', { name: '3' }))
    expect(p.getByText(/in total$/).textContent).not.toBe(total)

    fireEvent.click(p.getByRole('button', { name: /^Next: at the shop/ }))
    expect(tab('At the shop')).toHaveAttribute('aria-selected', 'true')
  })

  it('at the shop: section groups, chip menu, ticks strike in place', () => {
    renderFlow(['butter-chicken', 'dahl'], 'shop')
    const p = within(panel())
    expect(p.getByRole('heading', { name: 'To buy' })).toBeInTheDocument()
    const pantry = p.getByRole('region', { name: 'Pantry' })
    expect(
      within(pantry).getAllByRole('heading', { level: 4 }).length
    ).toBeGreaterThan(0)
    const before = tapCount()
    const box = p.getAllByRole('checkbox', { checked: false })[0]
    fireEvent.click(box ?? document.body)
    expect(box).toBeChecked()
    expect(box?.closest('li')).toHaveClass('list-row--done')
    expect(p.getByText(/^In basket/)).toBeInTheDocument()
    expect(tapCount()).toBe(before)
    const second = p.getAllByRole('checkbox', { checked: false })[0]
    fireEvent.click(second ?? document.body)
    fireEvent.click(
      p.getAllByRole('button', { name: /^Undo / })[1] ?? document.body
    )
    expect(second).not.toBeChecked()
    expect(p.getAllByRole('button', { name: /^Undo / })).toHaveLength(1)
    settle()
    const rows = box?.closest('ul')?.querySelectorAll('li.list-row') ?? []
    expect(rows[rows.length - 1]).toBe(box?.closest('li'))
    fireEvent.click(
      p.getAllByRole('button', { name: /^Details for/ })[0] ?? document.body
    )
    expect(p.getAllByText(/^need |in total$/).length).toBeGreaterThan(0)
    expect(tapCount()).toBe(before - 1)
    fireEvent.click(p.getByRole('button', { name: /^Tap \d+ items?$/ }))

    fireEvent.click(
      p.getAllByRole('button', { name: /is kept in .*\. Change/ })[0] ??
        document.body
    )
    const menu = screen.getByRole('menu')
    expect(within(menu).getAllByRole('menuitemradio')).toHaveLength(4)
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: 'Bench' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    fireEvent.click(
      p.getAllByRole('button', { name: /is kept in/ })[0] ?? document.body
    )
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'a' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('adds catalogue and free-text extras with a stepper', () => {
    renderFlow([], 'shop')
    const p = within(panel())
    expect(p.getByText(/Nothing on your list yet/)).toBeInTheDocument()
    const input = p.getByRole('textbox', { name: 'Add an item' })
    fireEvent.change(input, { target: { value: 'hummus' } })
    fireEvent.click(p.getByRole('button', { name: 'Hummus' }))
    expect(input).toHaveValue('')
    expect(p.getByRole('region', { name: 'Deli' })).toBeInTheDocument()
    expect(p.getByText('extra')).toBeInTheDocument()
    expect(tapCount()).toBe(1)

    fireEvent.change(input, { target: { value: 'Birthday candles' } })
    fireEvent.submit(input)
    expect(p.getByRole('region', { name: 'Other' })).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'hummus' } })
    fireEvent.submit(input)
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input)
    expect(input).toHaveValue('   ')

    const stepper = within(p.getByRole('group', { name: 'Quantity of hummus' }))
    expect(stepper.getByText('2')).toBeInTheDocument()
    fireEvent.click(stepper.getByRole('button', { name: 'More hummus' }))
    expect(stepper.getByText('3')).toBeInTheDocument()
    fireEvent.click(stepper.getByRole('button', { name: 'Fewer hummus' }))
    fireEvent.click(stepper.getByRole('button', { name: 'Fewer hummus' }))
    fireEvent.click(p.getByRole('button', { name: 'Remove hummus' }))
    expect(p.queryByRole('region', { name: 'Deli' })).not.toBeInTheDocument()

    fireEvent.click(p.getByRole('checkbox', { name: /Birthday candles/ }))
    settle()
    fireEvent.click(tab('At home'))
    const other = within(within(panel()).getByRole('region', { name: 'Other' }))
    fireEvent.click(
      other.getByRole('button', { name: 'Details for Birthday candles' })
    )
    expect(
      other.queryByRole('group', { name: /^Move / })
    ).not.toBeInTheDocument()
    fireEvent.click(
      within(panel()).getByRole('checkbox', { name: /Birthday candles/ })
    )
    settle()
    expect(within(panel()).getByText(/Nothing to buy/)).toBeInTheDocument()
    expect(
      within(panel()).queryByText(/^Assumed at home/)
    ).not.toBeInTheDocument()
    fireEvent.click(tab('At the shop'))
    expect(
      screen.queryByRole('button', { name: /^Tap/ })
    ).not.toBeInTheDocument()
  })

  it('links back to Pick from an empty list', () => {
    renderFlow([], 'home')
    fireEvent.click(screen.getByRole('button', { name: 'Pick some recipes' }))
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('In the shop', () => {
  beforeEach(() => localStorage.clear())
  const renderTap = (picked: string[]) => {
    localStorage.setItem(PICKED_KEY, JSON.stringify(picked))
    return render(
      <MemoryRouter>
        <TapOff />
      </MemoryRouter>
    )
  }

  it('lists to-buy items by section without logging in', () => {
    renderTap(['dahl'])
    expect(
      screen.getByRole('heading', { name: 'In the shop' })
    ).toBeInTheDocument()
    expect(screen.getByText(/left to find$/)).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Fridge' })
    ).not.toBeInTheDocument()
    screen.getAllByRole('checkbox').forEach((box) => fireEvent.click(box))
    settle()
    expect(screen.getByText('All done!')).toBeInTheDocument()
  })

  it('points back to the list when there is nothing to buy', () => {
    renderTap([])
    expect(screen.getByText(/Nothing to tap off yet/)).toBeInTheDocument()
  })
})

describe('Print', () => {
  beforeEach(() => localStorage.clear())

  it('prints to-buy items by section, without already-have', () => {
    localStorage.setItem(PICKED_KEY, JSON.stringify(['dahl']))
    localStorage.setItem(STEP_KEY, JSON.stringify('shop'))
    let printed = 0
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <AuthProvider>
            <StoreProvider>
              <ShoppingFlow print={() => (printed += 1)} />
            </StoreProvider>
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(printed).toBe(1)
    const sheet = within(screen.getByTestId('print-sheet'))
    expect(sheet.getByText('Red lentil dahl · Serves 2')).toBeInTheDocument()
    expect(sheet.getByRole('heading', { name: 'Pantry' })).toBeInTheDocument()
    expect(sheet.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(
      0
    )
    expect(sheet.queryByText(/Salt/)).not.toBeInTheDocument()
    expect(sheet.getAllByText(/^need /).length).toBeGreaterThan(0)
  })

  it('defaults to window.print and lists extras without a need line', () => {
    localStorage.setItem(STEP_KEY, JSON.stringify('home'))
    localStorage.setItem(
      'ingre.list.extras',
      JSON.stringify([
        { id: 'free-x', name: 'candles', ingredientId: null, quantity: 1 }
      ])
    )
    const original = window.print
    let printed = 0
    window.print = () => {
      printed += 1
    }
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
    fireEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(printed).toBe(1)
    window.print = original
    const sheet = within(screen.getByTestId('print-sheet'))
    expect(sheet.getByText('Serves 2')).toBeInTheDocument()
    expect(sheet.queryByText(/^need /)).not.toBeInTheDocument()
  })
})
