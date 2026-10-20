import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from '../../../utils/auth/AuthContext'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import { FAVOURITES_KEY } from '../../../utils/storage/favourites'
import { PEOPLE_KEY } from '../../../utils/storage/people'
import { EXTRAS_KEY, STEP_KEY } from '../../../utils/storage/shoppingState'
import { PRIMARY_TAGS } from '../../Home/homeFilters'
import { ShoppingFlow, pickParams, withSaved } from '../ShoppingFlow'
import { NO_SAVED_HINT, filterRecipes, pickEmpty } from '../PickStep'

addFontAwesome()

const Where = () => {
  const { search } = useLocation()
  return <p data-testid="search">{search}</p>
}

const renderPick = (path = '/') =>
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <ShoppingFlow />
                  <Where />
                </>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  )

/** Titles of the Pick cards shown, in order. */
const cardTitles = () =>
  [...document.querySelectorAll('.recipe-grid li > button')]
    .map((card) => card.getAttribute('aria-labelledby') ?? '')
    .map((id) => document.getElementById(id)?.textContent)

const savedSwitch = () => screen.getByRole('switch', { name: 'Saved' })
const tagRow = () => screen.getByRole('list', { name: 'Filter by tag' })

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

beforeEach(() => localStorage.clear())

describe('Pick search (from the header, #163)', () => {
  it('filters the cards by the search text in the address', () => {
    renderPick('/?q=lemongrass')
    expect(cardTitles().length).toBeGreaterThan(0)
    expect(cardTitles().every((t) => t?.startsWith('Lemongrass'))).toBe(true)
  })

  it('finds the apple recipe when searching apples', () => {
    renderPick('/?q=apples')
    expect(cardTitles()).toEqual(['Pork chops with apples and onion'])
  })

  it('a search opens Pick even when the list was left on another step', () => {
    localStorage.setItem(STEP_KEY, '"shop"')
    renderPick('/?q=dahl')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pick' })
    ).toBeInTheDocument()
  })

  it('an unmatched search says so, with no button', () => {
    renderPick('/?q=%20%20zzzz%20')
    expect(screen.getByText(/^No recipes with zzzz yet\.$/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^\+ Add/ })).toBeNull()
  })

  it('a catalogue item can be added to the list as an extra, then viewed', () => {
    renderPick('/?q=Banana')
    expect(
      screen.getByText(
        'No recipes with banana yet. You can add banana to your list'
      )
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '+ Add banana' }))
    expect(JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? '[]')).toEqual([
      { id: 'banana', name: 'banana', ingredientId: 'banana', quantity: 1 }
    ])
    expect(screen.queryByRole('button', { name: '+ Add banana' })).toBeNull()
    fireEvent.click(
      screen.getByRole('button', {
        name: '✓ Banana is on your list. View list'
      })
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'At home' })
    ).toHaveFocus()
    expect(
      within(
        screen.getByRole('list', { name: 'Shopping list, 1 item' })
      ).getByText('Banana')
    ).toBeInTheDocument()
  })
})

describe('Saved filter on Pick (#160)', () => {
  it('on: only saved recipes; off: all recipes; announced as a switch, on or off', async () => {
    const user = userEvent.setup()
    localStorage.setItem(FAVOURITES_KEY, '["dahl","butter-chicken"]')
    renderPick()
    const all = cardTitles().length
    expect(savedSwitch()).not.toBeChecked()
    await user.click(savedSwitch())
    expect(savedSwitch()).toBeChecked()
    expect(screen.getByTestId('search')).toHaveTextContent('?saved=1')
    expect(cardTitles()).toEqual(['Butter chicken', 'Red lentil dahl'])
    await user.click(savedSwitch())
    expect(savedSwitch()).not.toBeChecked()
    expect(screen.getByTestId('search')).toHaveTextContent(/^$/)
    expect(cardTitles()).toHaveLength(all)
  })

  it('works from the keyboard with a visible focus ring', async () => {
    const user = userEvent.setup()
    renderPick()
    savedSwitch().focus()
    await user.keyboard(' ')
    expect(savedSwitch()).toBeChecked()
    expect(savedSwitch().closest('label')?.className).toContain(
      'data-[focus-visible]:focus-ring'
    )
  })

  it('with nothing saved, explains how to save a recipe', () => {
    renderPick('/?saved=1')
    expect(savedSwitch()).toBeChecked()
    expect(screen.getByText(NO_SAVED_HINT)).toHaveAttribute('role', 'status')
    expect(cardTitles()).toEqual([])
  })

  it('keeps other address params when switched', () => {
    const params = new URLSearchParams('q=egg')
    expect(withSaved(params, true).toString()).toBe('q=egg&saved=1')
    expect(
      withSaved(new URLSearchParams('q=egg&saved=1'), false).toString()
    ).toBe('q=egg')
    expect(pickParams(new URLSearchParams('saved=1&q=x'))).toEqual({
      query: 'x',
      savedOnly: true
    })
    expect(pickParams(new URLSearchParams(''))).toEqual({
      query: '',
      savedOnly: false
    })
  })
})

describe('Pick empty states', () => {
  const filter = {
    query: '',
    tags: [],
    savedOnly: false,
    savedIds: new Set<string>()
  }

  it('picks the right message', () => {
    expect(pickEmpty({ ...filter, savedOnly: true }, [])).toBe('no-saved')
    expect(pickEmpty({ ...filter, query: 'zz' }, [])).toBe('search')
    expect(pickEmpty(filter, [])).toBe('no-match')
    expect(pickEmpty(filter, filterRecipes(filter))).toBe('none')
    expect(
      pickEmpty(
        { ...filter, savedOnly: true, savedIds: new Set(['x']) },
        filterRecipes({ ...filter, savedOnly: true, savedIds: new Set(['x']) })
      )
    ).toBe('no-match')
  })

  it('a tag filter with no results keeps the plain message', () => {
    renderPick()
    const chips = within(tagRow())
    for (const name of ['Indian', 'Vietnamese'])
      fireEvent.click(chips.getByRole('button', { name }))
    expect(screen.getByText('No recipes')).toBeInTheDocument()
  })
})

describe('Pick tag chips (moved from the old Recipes screen)', () => {
  it('filters by every selected tag chip', () => {
    renderPick()
    const chips = within(tagRow())
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
    renderPick()
    const group = within(screen.getByRole('radiogroup', { name: 'Serves' }))
    expect(group.getByRole('radio', { name: '2' })).toBeChecked()
    fireEvent.click(group.getByRole('radio', { name: '1' }))
    expect(localStorage.getItem(PEOPLE_KEY)).toBe('1')
  })

  it('orders chips meal/diet first then cuisines, capitalised', () => {
    renderPick()
    const names = within(tagRow())
      .getAllByRole('button')
      .map((c) => c.textContent)
    expect(names.slice(0, 5)).toEqual([
      'Lunch',
      'Dinner',
      'Vegetarian',
      'Vegan',
      'Gluten-free'
    ])
    expect(names).toContain('Vietnamese')
  })

  it('on phones: one row of tags, More expands, active tags stay', () => {
    const restore = asPhone()
    renderPick()
    const chips = () =>
      within(tagRow())
        .getAllByRole('button')
        .map((b) => b.textContent)
    expect(
      chips().every((c) => PRIMARY_TAGS.includes((c ?? '').toLowerCase()))
    ).toBe(true)
    expect(chips()).not.toContain('Vietnamese')
    const more = screen.getByRole('button', { name: 'More ▾' })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Vietnamese' }))
    fireEvent.click(screen.getByRole('button', { name: 'Less ▴' }))
    expect(chips()).toContain('Vietnamese')
    restore()
  })

  it('on phones: Escape closes More and returns focus to it; other keys do not', () => {
    const restore = asPhone()
    renderPick()
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
    renderPick()
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
    renderPick()
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
