import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import {
  BASKET_KEY,
  EXTRAS_KEY,
  HAVE_KEY,
  PICKED_KEY,
  STEP_KEY
} from '../../../utils/storage/shoppingState'
import { PEOPLE_KEY } from '../../../utils/storage/people'
import { FAVOURITES_KEY } from '../../../utils/storage/favourites'
import TapOff from '../../TapOff/TapOff'
import { recipeCount } from '../PickStep'
import { ShoppingFlow, wantsStartNew } from '../ShoppingFlow'
import { tapLabel } from '../ShoppingListView'
import { assumedNames } from '../../../utils/shopping/shoppingList'

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
    const add = screen.getByRole('button', {
      name: 'Add Red lentil dahl to list'
    })
    expect(add).toHaveTextContent('+ Add')
    fireEvent.click(add)
    expect(add).toHaveAccessibleName('Remove Red lentil dahl from list')
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
      'Assumed at home: oil, salt, pepper'
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

    fireEvent.click(p.getByRole('button', { name: 'Details for garlic' }))
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

    expect(p.queryByRole('button', { name: /is kept in/ })).toBeNull()
    expect(p.queryByRole('group', { name: /^Move / })).toBeNull()
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
      within(panel()).getByText('Assumed at home: oil, salt, pepper')
    ).toBeInTheDocument()
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
      <MockedProvider mocks={[]}>
        <MemoryRouter initialEntries={['/tapoff']}>
          <AuthProvider>
            <StoreProvider>
              <Routes>
                <Route
                  path="/tapoff"
                  element={<TapOff />}
                />
                <Route
                  path="/ingredients"
                  element={<ShoppingFlow />}
                />
              </Routes>
            </StoreProvider>
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
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
    const done = within(screen.getByRole('region', { name: 'All done' }))
    fireEvent.click(done.getByRole('button', { name: 'Start a new list' }))
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
    expect(localStorage.getItem(PICKED_KEY)).toBe('[]')
    expect(screen.getByRole('status')).toHaveTextContent('List cleared')
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

describe('Start a new list', () => {
  beforeEach(() => localStorage.clear())

  it('reads the router flag only when it is exactly startNew: true', () => {
    expect(wantsStartNew({ startNew: true })).toBe(true)
    expect(wantsStartNew({ startNew: 1 })).toBe(false)
    expect(wantsStartNew({})).toBe(false)
    expect(wantsStartNew(null)).toBe(false)
    expect(wantsStartNew('x')).toBe(false)
  })

  it('clears picks, ticks and extras (not hearts or Serves), goes to Pick; Undo restores', () => {
    localStorage.setItem(PEOPLE_KEY, '3')
    localStorage.setItem(FAVOURITES_KEY, '["dahl"]')
    localStorage.setItem(HAVE_KEY, '["onion"]')
    localStorage.setItem(BASKET_KEY, '["garlic"]')
    localStorage.setItem(
      EXTRAS_KEY,
      '[{"id":"free-x","name":"x","ingredientId":null,"quantity":1}]'
    )
    renderFlow(['dahl'], 'home')
    expect(screen.queryByRole('region', { name: 'All done' })).toBeNull()
    fireEvent.click(
      within(panel()).getByRole('button', { name: 'Start a new list' })
    )
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
    expect(localStorage.getItem(PICKED_KEY)).toBe('[]')
    expect(localStorage.getItem(HAVE_KEY)).toBe('[]')
    expect(localStorage.getItem(BASKET_KEY)).toBe('[]')
    expect(localStorage.getItem(EXTRAS_KEY)).toBe('[]')
    expect(localStorage.getItem(PEOPLE_KEY)).toBe('3')
    expect(localStorage.getItem(FAVOURITES_KEY)).toBe('["dahl"]')
    expect(screen.queryByRole('dialog')).toBeNull()

    act(() => jest.advanceTimersByTime(9999))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(tab('At home')).toHaveAttribute('aria-selected', 'true')
    expect(localStorage.getItem(PICKED_KEY)).toBe('["dahl"]')
    expect(localStorage.getItem(HAVE_KEY)).toBe('["onion"]')
    expect(localStorage.getItem(BASKET_KEY)).toBe('["garlic"]')
    expect(localStorage.getItem(EXTRAS_KEY)).toContain('free-x')
    expect(screen.queryByText(/List cleared/)).toBeNull()

    fireEvent.click(
      within(panel()).getByRole('button', { name: 'Start a new list' })
    )
    act(() => jest.advanceTimersByTime(10000))
    expect(screen.queryByText(/List cleared/)).toBeNull()
    expect(
      within(panel()).queryByRole('button', { name: 'Start a new list' })
    ).toBeNull()
  })

  it('shows a calm All done card once everything at the shop is ticked', () => {
    renderFlow(['dahl'], 'shop')
    within(panel())
      .getAllByRole('checkbox')
      .forEach((box) => fireEvent.click(box))
    settle()
    expect(screen.queryByRole('heading', { name: 'To buy' })).toBeNull()
    expect(within(panel()).queryAllByRole('checkbox')).toHaveLength(0)
    const basket = screen.getByRole('button', { name: /^In basket \(\d+\) ▾$/ })
    expect(basket).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(basket)
    expect(basket).toHaveAttribute('aria-expanded', 'true')
    expect(basket).toHaveTextContent('▴')
    expect(
      within(
        document.getElementById('in-basket') ?? document.body
      ).getAllByRole('checkbox', { checked: true }).length
    ).toBeGreaterThan(0)
    const done = within(screen.getByRole('region', { name: 'All done' }))
    fireEvent.click(done.getByRole('button', { name: 'Start a new list' }))
    expect(tab('Pick')).toHaveAttribute('aria-selected', 'true')
  })
})

describe('PO shopper pass', () => {
  beforeEach(() => localStorage.clear())

  it('typing a staple adds it: Pantry at the shop, Cupboard at home, stepper only', () => {
    renderFlow([], 'shop')
    const input = screen.getByRole('textbox', { name: 'Add an item' })
    fireEvent.change(input, { target: { value: 'salt' } })
    fireEvent.submit(input)
    const pantry = within(screen.getByRole('region', { name: 'Pantry' }))
    expect(pantry.getByRole('checkbox', { name: /Salt/ })).toBeInTheDocument()
    expect(
      pantry.getByRole('group', { name: 'Quantity of salt' })
    ).toBeInTheDocument()
    expect(pantry.queryByText(/×/)).toBeNull()
    expect(tapCount()).toBe(1)
    fireEvent.click(tab('At home'))
    const cupboard = within(screen.getByRole('region', { name: 'Cupboard' }))
    expect(cupboard.getByRole('checkbox', { name: /Salt/ })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Spice rack' })).toBeNull()
  })

  it('renders each step once: no hidden duplicate inputs or buttons', () => {
    localStorage.setItem(
      EXTRAS_KEY,
      '[{"id":"free-x","name":"x","ingredientId":null,"quantity":1}]'
    )
    const { container } = renderFlow(['dahl'], 'home')
    expect(
      container.querySelectorAll('input[aria-label="Add an item"], #add-item')
        .length
    ).toBeLessThanOrEqual(1)
    expect(
      screen.getAllByRole('textbox', { name: 'Add an item' })
    ).toHaveLength(1)
    expect(
      [...container.querySelectorAll('button')].filter(
        (b) =>
          b.textContent === ' Start a new list' ||
          b.textContent === 'Start a new list'
      )
    ).toHaveLength(1)
    expect(container.querySelectorAll('[role=tabpanel]')).toHaveLength(1)
    expect(container.querySelectorAll('[hidden]')).toHaveLength(0)
  })
})

describe('tick clock regression (pointer resting, no events)', () => {
  beforeEach(() => localStorage.clear())

  it('moves the row exactly 2s after a single tick with no further events', () => {
    renderFlow(['dahl'], 'home')
    const box = within(panel()).getAllByRole('checkbox')[0]
    fireEvent.click(box ?? document.body)
    // nothing else happens: no pointer, focus or other events until the clock runs out
    act(() => jest.advanceTimersByTime(1999))
    expect(screen.queryByRole('button', { name: /Already have/ })).toBeNull()
    act(() => jest.advanceTimersByTime(1))
    expect(box?.closest('li')).toHaveClass('list-row--leaving')
    act(() => jest.advanceTimersByTime(200))
    expect(
      screen.getByRole('button', { name: /^Already have \(1\)/ })
    ).toBeInTheDocument()
  })
})
