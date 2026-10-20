import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import {
  BASKET_KEY,
  EXTRAS_KEY,
  HAVE_KEY,
  PICKED_KEY,
  STEP_KEY
} from '../../../utils/storage/shoppingState'
import { PEOPLE_KEY } from '../../../utils/storage/people'
import { FAVOURITES_KEY } from '../../../utils/storage/favourites'
import TapOff, { inBasketLine, stillToBuyLine } from '../../TapOff/TapOff'
import {
  PICK_NEXT_HINT,
  PICK_START_HINT,
  pickHint,
  recipeCount
} from '../PickStep'
import { PICKED_MARK } from '../../../components/Widgets/RecipeCard/PickCard'
import {
  CLEARED_STATUS_ID,
  HOME_LABEL,
  ShoppingFlow,
  wantsStartNew
} from '../ShoppingFlow'
import { basketCount, DONE_SHOPPING } from '../ShoppingListView'
import { assumedNames } from '../../../utils/shopping/shoppingList'

addFontAwesome()

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

const STEP_NAMES = ['Pick', 'At home', 'At the shop']
/** The current step's heading (each step panel is named by it). */
const stepHeading = (name: string) =>
  screen.getByRole('heading', { level: 1, name })
const expectStep = (name: string) =>
  expect(stepHeading(name)).toBeInTheDocument()
const panel = () =>
  screen.getByRole('region', { name: /^(Pick|At home|At the shop)$/ })
const homeButton = () => screen.getByRole('button', { name: HOME_LABEL })
const currentStep = () =>
  STEP_NAMES.findIndex(
    (name) => screen.queryByRole('heading', { level: 1, name }) !== null
  )
/** One swipe on the step viewport: -1 back a step, +1 forward. */
const swipeStep = (direction: number) => {
  const viewport = document.querySelector('.flow-viewport') ?? document.body
  Object.defineProperty(viewport, 'clientWidth', {
    value: 400,
    configurable: true
  })
  fireEvent.touchStart(viewport, { touches: [{ clientX: 200, clientY: 1 }] })
  fireEvent.touchMove(viewport, {
    touches: [{ clientX: 200 - direction * 300, clientY: 1 }]
  })
  fireEvent.touchEnd(viewport)
}
/** Moves to a step the way a person can: Home for Pick, swipes for the others. */
const goStep = (name: string) => {
  if (name === 'Pick') {
    fireEvent.click(homeButton())
    return
  }
  const target = STEP_NAMES.indexOf(name)
  while (currentStep() !== target) swipeStep(Math.sign(target - currentStep()))
}
const leftToBuy = () => {
  const text =
    screen.getAllByText(/^\d+ of \d+ in basket$/)[0]?.textContent ?? ''
  const match = text.match(/^(\d+) of (\d+) in basket$/)
  return Number(match?.[2]) - Number(match?.[1])
}

describe('labels', () => {
  it('pluralises', () => {
    expect(basketCount(1, 1)).toBe('1 of 1 in basket')
    expect(basketCount(12, 29)).toBe('12 of 29 in basket')
    expect(inBasketLine(1)).toBe('1 item is in the basket')
    expect(inBasketLine(12)).toBe('12 items are in the basket')
    expect(stillToBuyLine(0)).toBe('0 are still to buy')
    expect(stillToBuyLine(1)).toBe('1 is still to buy')
    expect(DONE_SHOPPING).toBe("I'm done shopping")
    expect(
      assumedNames([
        { name: 'olive oil' },
        { name: 'sesame oil' },
        { name: 'Salt' },
        { name: 'black pepper' }
      ])
    ).toBe('oil, salt, pepper')
    expect(recipeCount(1)).toBe('1 recipe')
    expect(recipeCount(3)).toBe('3 recipes')
  })
})

describe('ShoppingFlow', () => {
  beforeEach(() => localStorage.clear())

  it('picks recipes without logging in, then moves on only when asked', () => {
    renderFlow()
    expectStep('Pick')
    expect(screen.getByText('0 recipes')).toBeInTheDocument()
    const card = screen.getByRole('button', { name: 'Red lentil dahl' })
    expect(card).toHaveAttribute('aria-pressed', 'false')
    expect(card).not.toHaveTextContent(PICKED_MARK)
    fireEvent.click(card)
    expect(card).toHaveAccessibleName('Red lentil dahl')
    expect(card).toHaveAttribute('aria-pressed', 'true')
    expect(card).toHaveTextContent(PICKED_MARK)
    expect(screen.getByText('1 recipe')).toBeInTheDocument()
    expect(localStorage.getItem(PICKED_KEY)).toBe('["dahl"]')
    expectStep('Pick')
    fireEvent.click(
      screen.getByRole('button', {
        name: /^Next: check at home \(\d+\)$/
      })
    )
    expectStep('At home')
    expect(localStorage.getItem(STEP_KEY)).toBe('"home"')
    expect(localStorage.getItem(PICKED_KEY)).toBe('["dahl"]')
    expect(localStorage.getItem(FAVOURITES_KEY)).toBeNull()
    expect(
      within(panel()).getByRole('heading', { name: 'Check your kitchen' })
    ).toBeInTheDocument()
  })

  it('after the first pick, a hint says where you are and what is next, announced without moving focus (#157)', () => {
    renderFlow()
    const hint = document.getElementById('pick-next-hint')
    expect(hint).toHaveAttribute('role', 'status')
    expect(hint).toHaveTextContent(PICK_START_HINT)
    const dahl = screen.getByRole('button', { name: 'Red lentil dahl' })
    const korma = screen.getByRole('button', { name: 'Chicken korma' })
    dahl.focus()
    fireEvent.click(dahl)
    // same always-present live region, new text; focus stays on the card
    expect(document.getElementById('pick-next-hint')).toBe(hint)
    expect(hint).toHaveTextContent(PICK_NEXT_HINT)
    expect(dahl).toHaveFocus()
    fireEvent.click(korma)
    expect(hint).toHaveTextContent(PICK_NEXT_HINT)
    fireEvent.click(korma)
    fireEvent.click(dahl)
    expect(hint).toHaveTextContent(PICK_START_HINT)
    expect(dahl).toHaveFocus()
    expect(pickHint(0)).toBe(PICK_START_HINT)
    expect(pickHint(1)).toBe(PICK_NEXT_HINT)
    expect(pickHint(5)).toBe(PICK_NEXT_HINT)
  })

  it('keeps Next disabled until one recipe is picked', () => {
    renderFlow()
    const next = screen.getByRole('button', {
      name: /^Next: check at home \(\d+\)$/
    })
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).toHaveAccessibleDescription(PICK_START_HINT)
    expect(screen.getByText(PICK_START_HINT)).toBeInTheDocument()
    next.focus()
    expect(next).toHaveFocus()
    fireEvent.click(next)
    expectStep('Pick')
    fireEvent.click(screen.getByRole('button', { name: 'Red lentil dahl' }))
    expect(next).not.toHaveAttribute('aria-disabled')
    expect(screen.queryByText(PICK_START_HINT)).not.toBeInTheDocument()
    expect(next).toHaveAccessibleDescription(PICK_NEXT_HINT)
    fireEvent.click(next)
    expectStep('At home')
  })

  it('reopens on the last step; one Home control replaces the stepper (#161)', () => {
    renderFlow(['dahl'], 'shop')
    expectStep('At the shop')
    expect(screen.queryByRole('tablist')).toBeNull()
    expect(screen.queryAllByRole('tab')).toHaveLength(0)
    expect(screen.getAllByRole('button', { name: HOME_LABEL })).toHaveLength(1)
    expect(homeButton()).toHaveClass('focus-visible:focus-ring')
    fireEvent.click(homeButton())
    expectStep('Pick')
    expect(stepHeading('Pick')).toHaveFocus()
    expect(localStorage.getItem(STEP_KEY)).toBe('"pick"')
    // selections are kept
    expect(localStorage.getItem(PICKED_KEY)).toBe('["dahl"]')
    expect(
      screen.getByRole('button', { name: 'Red lentil dahl' })
    ).toHaveAttribute('aria-pressed', 'true')
    // already on Pick: Home still moves focus to the heading
    act(() => homeButton().focus())
    fireEvent.click(homeButton())
    expect(stepHeading('Pick')).toHaveFocus()
  })

  it('Next moves to the next step and focuses its heading', () => {
    renderFlow(['dahl'])
    fireEvent.click(
      screen.getByRole('button', { name: /^Next: check at home \(\d+\)$/ })
    )
    expect(stepHeading('At home')).toHaveFocus()
    fireEvent.click(
      screen.getByRole('button', { name: /^Next: at the shop \(\d+\)$/ })
    )
    expect(stepHeading('At the shop')).toHaveFocus()
  })

  it('swipes past 40% of the width, snaps back otherwise, ignores vertical scrolls', () => {
    renderFlow(['dahl'], 'home')
    const viewport = document.querySelector('.flow-viewport') ?? document.body
    Object.defineProperty(viewport, 'clientWidth', { value: 400 })
    const swipe = (from: number, to: number, dy = 0) => {
      fireEvent.touchStart(viewport, {
        touches: [{ clientX: from, clientY: 100 }]
      })
      fireEvent.touchMove(viewport, {
        touches: [{ clientX: to, clientY: 100 + dy }]
      })
      expect(
        document.querySelectorAll('section[id^=flow-panel]').length > 1
      ).toBe(dy === 0)
      fireEvent.touchMove(viewport, {
        touches: [{ clientX: to, clientY: 100 + dy }]
      })
      fireEvent.touchEnd(viewport)
    }
    swipe(300, 200)
    expectStep('At home')
    swipe(300, 100)
    expectStep('At the shop')
    swipe(100, 300, 400)
    expectStep('At the shop')
    swipe(100, 300)
    expectStep('At home')
    swipe(100, 350)
    expectStep('Pick')
    swipe(100, 350)
    expectStep('Pick')
    swipe(350, 100)
    expectStep('At home')
    fireEvent.touchStart(viewport, { touches: [] })
    fireEvent.touchMove(viewport, { touches: [] })
    fireEvent.touchEnd(viewport)
    fireEvent.touchStart(viewport, { touches: [{ clientX: 1, clientY: 1 }] })
    fireEvent.touchCancel(viewport)
    fireEvent.touchMove(viewport, { touches: [{ clientX: 300, clientY: 1 }] })
    expectStep('At home')
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
    expect(have.querySelector('.list-have__chevron svg')).not.toBeNull()
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
    expectStep('At the shop')
  })

  it('at the shop: section groups, chip menu, ticks strike in place', () => {
    renderFlow(['butter-chicken', 'dahl'], 'shop')
    const p = within(panel())
    expect(p.getByRole('heading', { name: 'To buy' })).toBeInTheDocument()
    const pantry = p.getByRole('region', { name: 'Pantry' })
    expect(
      within(pantry).getAllByRole('heading', { level: 4 }).length
    ).toBeGreaterThan(0)
    const before = leftToBuy()
    const box = p.getAllByRole('checkbox', { checked: false })[0]
    fireEvent.click(box ?? document.body)
    expect(box).toBeChecked()
    expect(box?.closest('li')).toHaveClass('list-row--done')
    expect(p.getByText(/^In basket/)).toBeInTheDocument()
    expect(leftToBuy()).toBe(before)
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
    expect(leftToBuy()).toBe(before - 1)
    fireEvent.click(p.getByRole('button', { name: DONE_SHOPPING }))

    expect(p.queryByRole('button', { name: /is kept in/ })).toBeNull()
    expect(p.queryByRole('group', { name: /^Move / })).toBeNull()
  })

  it('adds catalogue and free-text extras with a stepper', () => {
    renderFlow([], 'shop')
    const p = within(panel())
    expect(p.getByText(/Nothing on your list yet/)).toBeInTheDocument()
    const input = p.getByRole('textbox', { name: 'Add an item' })
    fireEvent.change(input, { target: { value: 'hummus' } })
    fireEvent.click(p.getByRole('button', { name: /^Hummus/ }))
    expect(input).toHaveValue('')
    expect(p.getByRole('region', { name: 'Deli' })).toBeInTheDocument()
    expect(p.getByText('extra')).toBeInTheDocument()
    expect(leftToBuy()).toBe(1)

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
    goStep('At home')
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
    goStep('At the shop')
    expect(
      screen.getByRole('button', { name: DONE_SHOPPING })
    ).toBeInTheDocument()
    expect(screen.getByText('Nothing left to buy')).toBeInTheDocument()
  })

  it('extras come from the catalogue: badge and section, and once on the list (#162)', () => {
    renderFlow(['dahl'], 'shop')
    const p = within(panel())
    const input = p.getByRole('textbox', { name: 'Add an item' })
    fireEvent.change(input, { target: { value: 'banan' } })
    const option = p.getByRole('button', { name: /^Banana/ })
    // the same badge as in recipes (hidden from VoiceOver) and the shop section
    expect(option).toHaveTextContent(/^BNABananaFruit & Veg$/)
    expect(option.querySelector('[aria-hidden="true"]')).toHaveClass(
      'bg-badge-produce'
    )
    fireEvent.click(option)
    const veg = within(p.getByRole('region', { name: 'Fruit & Veg' }))
    expect(veg.getByRole('checkbox', { name: /Banana/ })).toBeInTheDocument()
    // garlic is already needed by the dahl: adding it again keeps one row and one chip
    const garlicRows = () =>
      veg.getAllByRole('checkbox', { name: /garlic/i }).length
    expect(garlicRows()).toBe(1)
    fireEvent.change(input, { target: { value: 'Garlic' } })
    fireEvent.submit(input)
    expect(garlicRows()).toBe(1)
    expect(
      within(
        screen.getByRole('list', { name: /^Shopping list, / })
      ).getAllByText(/garlic/i)
    ).toHaveLength(1)
  })

  it('links back to Pick from an empty list', () => {
    renderFlow([], 'home')
    fireEvent.click(screen.getByRole('button', { name: 'Pick some recipes' }))
    expectStep('Pick')
  })
})

describe('Shopping done', () => {
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
                  path="/"
                  element={<ShoppingFlow />}
                />
              </Routes>
            </StoreProvider>
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
  }

  it('shows basket and still-to-buy counts, and never the checklist', () => {
    renderTap(['dahl'])
    const heading = screen.getByRole('heading', { name: 'Shopping done' })
    expect(heading).toHaveAttribute('tabindex', '-1')
    expect(heading).toHaveFocus()
    expect(document.title).toBe('Shopping done')
    expect(screen.getByText('0 items are in the basket')).toBeInTheDocument()
    expect(screen.getByText(/are still to buy$/)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to my list' })
    ).toHaveAttribute('href', '/')
  })

  it('still shows the finish screen when the basket is empty', () => {
    renderTap([])
    expect(screen.getByText('0 items are in the basket')).toBeInTheDocument()
    expect(screen.getByText('0 are still to buy')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('uses the singular when one item is in the basket', () => {
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify([
        {
          id: 'free-lemon',
          name: 'Lemon',
          ingredientId: null,
          quantity: 1
        }
      ])
    )
    localStorage.setItem(BASKET_KEY, JSON.stringify(['extra:free-lemon']))
    renderTap([])
    expect(screen.getByText('1 item is in the basket')).toBeInTheDocument()
    expect(
      screen.queryByText('1 items are in the basket')
    ).not.toBeInTheDocument()
    expect(screen.getByText('0 are still to buy')).toBeInTheDocument()
  })

  it('starts a new list from the finish screen', () => {
    localStorage.setItem(STEP_KEY, JSON.stringify('shop'))
    renderTap(['dahl'])
    fireEvent.click(screen.getByRole('button', { name: 'Start a new list' }))
    expectStep('Pick')
    expect(localStorage.getItem(PICKED_KEY)).toBe('[]')
    expect(document.getElementById(CLEARED_STATUS_ID)).toHaveTextContent(
      'List cleared'
    )
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus()
  })

  it('opens from the shop bar without repeating the list', () => {
    localStorage.setItem(PICKED_KEY, JSON.stringify(['dahl']))
    localStorage.setItem(STEP_KEY, JSON.stringify('shop'))
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <StoreProvider>
              <Routes>
                <Route
                  path="/"
                  element={<ShoppingFlow />}
                />
                <Route
                  path="/tapoff"
                  element={<TapOff />}
                />
              </Routes>
            </StoreProvider>
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    )
    expect(
      screen.getAllByText(/^\d+ of \d+ in basket$/).length
    ).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: DONE_SHOPPING }))
    expect(
      screen.getByRole('heading', { name: 'Shopping done' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Back to my list' }))
    const done = screen.getByRole('button', { name: DONE_SHOPPING })
    expectStep('At the shop')
    expect(done).toBeInTheDocument()
    expect(done).toHaveFocus()
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
    expectStep('Pick')
    expect(localStorage.getItem(PICKED_KEY)).toBe('[]')
    expect(localStorage.getItem(HAVE_KEY)).toBe('[]')
    expect(localStorage.getItem(BASKET_KEY)).toBe('[]')
    expect(localStorage.getItem(EXTRAS_KEY)).toBe('[]')
    expect(localStorage.getItem(PEOPLE_KEY)).toBe('3')
    expect(localStorage.getItem(FAVOURITES_KEY)).toBe('["dahl"]')
    expect(screen.queryByRole('dialog')).toBeNull()

    act(() => jest.advanceTimersByTime(9999))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expectStep('At home')
    expect(localStorage.getItem(PICKED_KEY)).toBe('["dahl"]')
    expect(localStorage.getItem(HAVE_KEY)).toBe('["onion"]')
    expect(localStorage.getItem(BASKET_KEY)).toBe('["garlic"]')
    expect(localStorage.getItem(EXTRAS_KEY)).toContain('free-x')
    expect(screen.queryByText(/List cleared/)).toBeNull()

    fireEvent.click(
      within(panel()).getByRole('button', { name: 'Start a new list' })
    )
    // the countdown only runs once focus has left the note
    act(() => jest.advanceTimersByTime(10000))
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus()
    act(() => homeButton().focus())
    act(() => jest.advanceTimersByTime(10000))
    expect(screen.queryByText(/List cleared/)).toBeNull()
    expect(
      within(panel()).queryByRole('button', { name: 'Start a new list' })
    ).toBeNull()
  })

  it('Undo is one-shot: it restores the list just cleared, then disappears', () => {
    renderFlow(['dahl'], 'home')
    const startNew = () =>
      fireEvent.click(
        within(panel()).getByRole('button', { name: 'Start a new list' })
      )
    startNew()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(localStorage.getItem(PICKED_KEY)).toBe('["dahl"]')
    expect(screen.queryByText(/List cleared/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()

    fireEvent.click(
      within(panel()).getAllByRole('checkbox', { checked: false })[0] ??
        document.body
    )
    settle()
    const newer = localStorage.getItem(HAVE_KEY)
    expect(newer).not.toBe('[]')
    startNew()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(localStorage.getItem(HAVE_KEY)).toBe(newer)
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
    act(() => jest.advanceTimersByTime(10000))
    expect(localStorage.getItem(HAVE_KEY)).toBe(newer)
  })

  const tapStartNew = () =>
    fireEvent.click(
      within(panel()).getByRole('button', { name: 'Start a new list' })
    )
  const box = (name: RegExp) => within(panel()).getByRole('checkbox', { name })
  const clearedStatus = () => document.getElementById(CLEARED_STATUS_ID)
  const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? '')

  it('a pick after clearing removes the Undo and the snapshot; At home and At the shop stay clear', () => {
    renderFlow(['dahl'], 'home')
    tapStartNew()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Butter chicken' }))
    expect(screen.queryByText(/List cleared/)).toBeNull()
    expect(clearedStatus()).toHaveTextContent(/^$/)
    goStep('At home')
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
    goStep('At the shop')
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
    expect(
      screen.getByRole('button', { name: DONE_SHOPPING })
    ).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(10000))
    expect(stored(PICKED_KEY)).toEqual(['butter-chicken'])
    expectStep('At the shop')
  })

  it('a step change after clearing removes the Undo for good, even back on Pick', () => {
    renderFlow(['dahl'], 'home')
    tapStartNew()
    goStep('At home')
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
    goStep('Pick')
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
    expect(stored(PICKED_KEY)).toEqual([])
  })

  it('a tick waiting on the tick clock never lands in the cleared list or removes its Undo', () => {
    renderFlow(['egg-fried-rice'], 'home')
    fireEvent.click(box(/eggs/i))
    tapStartNew()
    act(() => jest.advanceTimersByTime(3000))
    expect(stored(HAVE_KEY)).toEqual([])
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('Undo restores the ticks and progress exactly: Eggs ticked at home, saved and waiting ticks at the shop', () => {
    renderFlow(['egg-fried-rice'], 'home')
    fireEvent.click(box(/carrot/i))
    settle()
    fireEvent.click(box(/eggs/i))
    tapStartNew()
    expect(stored(HAVE_KEY)).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expectStep('At home')
    expect(new Set(stored(HAVE_KEY))).toEqual(new Set(['carrot', 'egg']))
    fireEvent.click(screen.getByRole('button', { name: /^Already have \(2\)/ }))
    expect(box(/eggs/i)).toBeChecked()
    expect(box(/carrot/i)).toBeChecked()

    goStep('At the shop')
    fireEvent.click(box(/jasmine rice/i))
    settle()
    fireEvent.click(box(/peas/i))
    act(() => jest.advanceTimersByTime(2000)) // its row is fading out
    fireEvent.click(box(/soy sauce/i)) // still waiting
    expect(box(/soy sauce/i)).toBeChecked()
    tapStartNew()
    expect(stored(BASKET_KEY)).toEqual([])
    act(() => jest.advanceTimersByTime(3000))
    expect(stored(BASKET_KEY)).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expectStep('At the shop')
    expect(new Set(stored(BASKET_KEY))).toEqual(
      new Set(['jasmine-rice', 'tinned-peas', 'soy-sauce'])
    )
    expect(new Set(stored(HAVE_KEY))).toEqual(new Set(['carrot', 'egg']))
    expect(stored(PICKED_KEY)).toEqual(['egg-fried-rice'])
    expect(box(/jasmine rice/i)).toBeChecked()
    expect(box(/peas/i)).toBeChecked()
    expect(box(/soy sauce/i)).toBeChecked()
    // the ticks that were waiting are back as saved ticks, exactly as the clock would have saved them
    expect(screen.getAllByText(/^\d+ of \d+ in basket$/)[0]).toHaveTextContent(
      '3 of 6 in basket'
    )
  })

  it('announces "List cleared" in a polite live region, focuses Undo (focus ring), then the restored step', () => {
    renderFlow(['dahl'], 'home')
    const status = clearedStatus()
    expect(status).toHaveAttribute('role', 'status')
    expect(status).toHaveTextContent(/^$/)
    tapStartNew()
    expect(clearedStatus()).toBe(status)
    expect(status).toHaveTextContent(/^List cleared$/)
    const undo = screen.getByRole('button', { name: 'Undo' })
    // Undo is reachable straight away: it has focus, not the Pick tab or a Serves radio
    expect(undo).toHaveFocus()
    expect(homeButton()).toBeInTheDocument()
    expect(undo).toHaveClass('focus-visible:focus-ring')
    fireEvent.click(undo)
    expect(status).toHaveTextContent(/^$/)
    expect(stepHeading('At home')).toHaveFocus()
  })

  it('pauses the 10s Undo countdown while focus is inside the note, and restarts it after', () => {
    renderFlow(['dahl'], 'home')
    tapStartNew()
    const undo = screen.getByRole('button', { name: 'Undo' })
    act(() => jest.advanceTimersByTime(60000))
    expect(undo).toBeInTheDocument()
    act(() => homeButton().focus())
    act(() => jest.advanceTimersByTime(9999))
    act(() => undo.focus())
    act(() => jest.advanceTimersByTime(60000))
    act(() => homeButton().focus())
    act(() => jest.advanceTimersByTime(9999))
    expect(undo).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(1))
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
    expect(clearedStatus()).toHaveTextContent(/^$/)
    expect(stored(PICKED_KEY)).toEqual([])
  })

  it('shows a calm All done card once everything at the shop is ticked', () => {
    renderFlow(['dahl'], 'shop')
    within(panel())
      .getAllByRole('checkbox')
      .forEach((box) => fireEvent.click(box))
    settle()
    expect(screen.queryByRole('heading', { name: 'To buy' })).toBeNull()
    // only the card's button: the quiet link shows only while shopping is in progress
    expect(
      screen.getAllByRole('button', { name: /Start a new list/ })
    ).toHaveLength(1)
    expect(within(panel()).queryAllByRole('checkbox')).toHaveLength(0)
    const basket = screen.getByRole('button', { name: /^In basket \(\d+\)$/ })
    expect(basket).toHaveAttribute('aria-expanded', 'false')
    expect(basket.querySelector('.list-have__chevron svg')).not.toBeNull()
    fireEvent.click(basket)
    expect(basket).toHaveAttribute('aria-expanded', 'true')
    expect(
      within(
        document.getElementById('in-basket') ?? document.body
      ).getAllByRole('checkbox', { checked: true }).length
    ).toBeGreaterThan(0)
    const done = within(screen.getByRole('region', { name: 'All done' }))
    fireEvent.click(done.getByRole('button', { name: 'Start a new list' }))
    expectStep('Pick')
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
    expect(leftToBuy()).toBe(1)
    goStep('At home')
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
    expect(container.querySelectorAll('section[id^=flow-panel]')).toHaveLength(
      1
    )
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
