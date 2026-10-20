import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import Home from '../Home'
import { PRIMARY_TAGS } from '../homeFilters'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { StoreProvider } from '../../../utils/state/GlobalState'
import { PEOPLE_KEY } from '../../../utils/storage/people'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'

addFontAwesome()

const renderHome = () =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter>
        <AuthProvider>
          <StoreProvider>
            <Home />
          </StoreProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

const cardTitles = () =>
  screen
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)

const search = () =>
  screen.getByPlaceholderText('Search recipes or ingredients')

/** Pretends to be a phone: every media query matches. */
const asPhone = () => {
  const original = window.matchMedia
  window.matchMedia = (query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
  return () => {
    window.matchMedia = original
  }
}

/** jsdom has no layout: give an element a fixed horizontal box. */
const place = (element: Element, left: number, width: number) => {
  element.getBoundingClientRect = () => new DOMRect(left, 0, width, 32)
}

const tagRow = () => screen.getByRole('list', { name: 'Filter by tag' })

describe('Home', () => {
  beforeEach(() => localStorage.clear())

  it('lists every library recipe as a card with its local name', () => {
    renderHome()
    expect(cardTitles()).toContain('Shaking beef')
    expect(screen.getByText('bò lúc lắc')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Save / })).toHaveLength(
      cardTitles().length
    )
  })

  it('searches the library as you type', () => {
    renderHome()
    fireEvent.change(search(), { target: { value: 'lemongrass' } })
    expect(cardTitles().every((t) => t?.startsWith('Lemongrass'))).toBe(true)
  })

  it('finds the apple recipe when searching apples', () => {
    renderHome()
    fireEvent.change(search(), { target: { value: 'apples' } })
    expect(cardTitles()).toEqual(['Pork chops with apples and onion'])
  })

  it('an unmatched empty search says so, with no button', () => {
    renderHome()
    fireEvent.change(search(), { target: { value: '  zzzz ' } })
    expect(screen.getByRole('status')).toHaveTextContent(
      /^No recipes with zzzz yet\.$/
    )
    expect(screen.queryByRole('button', { name: /^\+ Add/ })).toBeNull()
  })

  it('a catalogue item can be added to the list as an extra', () => {
    renderHome()
    fireEvent.change(search(), { target: { value: 'Banana' } })
    expect(screen.getByRole('status')).toHaveTextContent(
      'No recipes with banana yet. You can add banana to your list'
    )
    fireEvent.click(screen.getByRole('button', { name: '+ Add banana' }))
    expect(JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? '[]')).toEqual([
      { id: 'banana', name: 'banana', ingredientId: 'banana', quantity: 1 }
    ])
    const view = screen.getByRole('link', {
      name: '✓ Banana is on your list. View list'
    })
    expect(view).toHaveAttribute('href', '/ingredients')
    expect(screen.queryByRole('button', { name: '+ Add banana' })).toBeNull()
  })

  it('shows the confirmed state when the item is already on the list', () => {
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify([
        { id: 'banana', name: 'banana', ingredientId: 'banana', quantity: 2 }
      ])
    )
    renderHome()
    fireEvent.change(search(), { target: { value: 'bananas' } })
    expect(
      screen.getByRole('link', { name: '✓ Banana is on your list. View list' })
    ).toBeInTheDocument()
  })

  it('a tag filter with no results keeps the plain message', () => {
    renderHome()
    const chips = within(screen.getByRole('list', { name: 'Filter by tag' }))
    for (const name of ['Indian', 'Vietnamese'])
      fireEvent.click(chips.getByRole('button', { name }))
    expect(screen.getByText('No recipes')).toBeInTheDocument()
  })

  it('filters by every selected tag chip', () => {
    renderHome()
    const chips = within(screen.getByRole('list', { name: 'Filter by tag' }))
    const indian = chips.getByRole('button', { name: 'Indian' })
    fireEvent.click(indian)
    expect(indian).toHaveAttribute('aria-pressed', 'true')
    const indianCount = cardTitles().length
    fireEvent.click(chips.getByRole('button', { name: 'Vegan' }))
    expect(cardTitles().length).toBeLessThan(indianCount)
    fireEvent.click(indian)
    expect(indian).toHaveAttribute('aria-pressed', 'false')
  })

  it('selects people in an accessible radio group, default 2, persisted', () => {
    renderHome()
    const group = within(screen.getByRole('radiogroup', { name: 'Serves' }))
    expect(group.getByRole('radio', { name: '2' })).toBeChecked()
    fireEvent.click(group.getByRole('radio', { name: '1' }))
    expect(group.getByRole('radio', { name: '1' })).toBeChecked()
    expect(localStorage.getItem(PEOPLE_KEY)).toBe('1')
  })

  it('orders chips meal/diet first then cuisines, capitalised', () => {
    renderHome()
    const chips = within(
      screen.getByRole('list', { name: 'Filter by tag' })
    ).getAllByRole('button')
    const names = chips.map((c) => c.textContent)
    expect(names.slice(0, 5)).toEqual([
      'Lunch',
      'Dinner',
      'Vegetarian',
      'Vegan',
      'Gluten-free'
    ])
    expect(names).toContain('Vietnamese')
  })

  it('on phones: short placeholder, one row of tags, More expands, active tags stay', () => {
    const original = window.matchMedia
    window.matchMedia = (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    })
    renderHome()
    expect(
      screen.getByPlaceholderText('Search recipes or ingredients')
    ).toBeInTheDocument()
    const chips = () =>
      within(screen.getByRole('list', { name: 'Filter by tag' }))
        .getAllByRole('button')
        .map((b) => b.textContent)
    expect(
      chips().every((c) => PRIMARY_TAGS.includes((c ?? '').toLowerCase()))
    ).toBe(true)
    expect(chips()).toContain('Dinner')
    expect(chips()).not.toContain('Vietnamese')
    const more = screen.getByRole('button', { name: 'More ▾' })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Vietnamese' }))
    fireEvent.click(screen.getByRole('button', { name: 'Less ▴' }))
    expect(chips()).toContain('Vietnamese')
    expect(screen.getByRole('button', { name: 'More ▾' })).toBeInTheDocument()
    window.matchMedia = original
  })

  it('on phones: Escape closes More and returns focus to it; other keys do not', () => {
    const restore = asPhone()
    renderHome()
    const more = screen.getByRole('button', { name: 'More ▾' })
    fireEvent.click(more)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(more).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    expect(more).toHaveFocus()
    restore()
  })

  it('on phones: a focused chip in the one row scrolls clear of More', () => {
    const restore = asPhone()
    renderHome()
    const row = tagRow()
    place(row, 0, 300)
    place(screen.getByRole('button', { name: 'More ▾' }), 230, 70)
    const chip = within(row).getByRole('button', { name: 'Dinner' })

    row.scrollLeft = 0
    place(chip, 200, 60)
    fireEvent.focus(chip)
    expect(row.scrollLeft).toBe(42)

    row.scrollLeft = 50
    place(chip, -20, 60)
    fireEvent.focus(chip)
    expect(row.scrollLeft).toBe(30)

    place(chip, 10, 60)
    fireEvent.focus(chip)
    expect(row.scrollLeft).toBe(30)

    // without a More chip in the bar, the chip only needs to clear the row edge
    const more = screen.getByRole('button', { name: 'More ▾' })
    const bar = more.parentElement ?? document.body
    more.remove()
    row.scrollLeft = 0
    place(chip, 200, 60)
    fireEvent.focus(chip)
    expect(row.scrollLeft).toBe(0)
    place(chip, 280, 60)
    fireEvent.focus(chip)
    expect(row.scrollLeft).toBe(40)
    bar.append(more)
    restore()
  })

  it('a focused chip never scrolls when the tags are not on one row', () => {
    const restore = asPhone()
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'More ▾' }))
    const row = tagRow()
    place(row, 0, 300)
    const chip = within(row).getByRole('button', { name: 'Dinner' })
    place(chip, 400, 60)
    row.scrollLeft = 0
    fireEvent.focus(chip)
    expect(row.scrollLeft).toBe(0)
    restore()
  })
})
