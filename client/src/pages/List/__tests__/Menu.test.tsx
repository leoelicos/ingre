import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  pick,
  pickedIds,
  recipes,
  region,
  renderList
} from '../../../test/renderList'
import { recipeById } from '../../../test/library'
import { resetViewport, setViewportWidth } from '../../../test/media'
import { CLASH_REASON, COURSE_TITLE, WineLine } from '../Menu'

expect.extend(toHaveNoViolations)

/* #219 Composed menus: the Menu section on the list page. */

beforeEach(() => localStorage.clear())
afterEach(resetViewport)

const menu = () => within(region('Menu'))
const course = (name: string) =>
  within(
    menu().getByRole('heading', { level: 3, name }).parentElement ??
      document.body
  )

describe('Menu section (#219)', () => {
  it('is not on the page until a recipe is picked', () => {
    renderList()
    expect(screen.queryByRole('region', { name: 'Menu' })).toBeNull()
  })

  it('asks for a main while only a starter is picked', () => {
    pick('greek-salad-haloumi')
    renderList()
    expect(
      menu().getByText(/Pick a main and Menu suggests/)
    ).toBeInTheDocument()
    expect(menu().queryByRole('heading', { level: 3 })).toBeNull()
  })

  it('shows the three courses in order, with the picked main and its wine', () => {
    pick('butter-chicken')
    renderList()
    expect(
      menu()
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent)
    ).toEqual(['Starter', 'Main', 'Dessert'])
    expect(COURSE_TITLE.main).toBe('Main')
    expect(course('Main').getByText('Butter chicken')).toBeInTheDocument()
    expect(
      course('Main').getByText('Wine: Gewürztraminer or off-dry Riesling')
    ).toBeInTheDocument()
    expect(
      within(region('Menu')).getByText('1 course picked')
    ).toBeInTheDocument()
  })

  it('suggests starters that suit a chicken main, each with a wine, and says no dessert fits yet', () => {
    pick('butter-chicken')
    renderList()
    const starter = course('Starter')
    for (const name of [
      'Greek salad with haloumi',
      'Prawn and pork rice paper rolls (gỏi cuốn)',
      'San choy bau'
    ])
      expect(
        starter.getByRole('button', { name: `Add ${name} to your list` })
      ).toBeInTheDocument()
    expect(starter.getAllByText(/^Wine: /)).toHaveLength(3)
    expect(
      course('Dessert').getByText(
        'No dessert in the library suits your main yet.'
      )
    ).toBeInTheDocument()
  })

  it("leaves out starters that repeat the main's pork", () => {
    pick('pork-chops-apple-onion')
    renderList()
    const starter = course('Starter')
    expect(starter.getAllByRole('button')).toHaveLength(1)
    expect(
      starter.getByRole('button', { name: /Greek salad with haloumi/ })
    ).toBeInTheDocument()
  })

  it('adds a suggested starter to the list in one tap, and the menu then shows it picked', () => {
    pick('butter-chicken')
    renderList()
    fireEvent.click(
      course('Starter').getByRole('button', {
        name: 'Add Greek salad with haloumi to your list'
      })
    )
    expect(pickedIds()).toEqual(['butter-chicken', 'greek-salad-haloumi'])
    expect(recipes().getByText('Greek salad with haloumi')).toBeInTheDocument()
    expect(course('Starter').queryByRole('button')).toBeNull()
    expect(course('Starter').getByText('On your list')).toBeInTheDocument()
    expect(menu().getByText('2 courses picked')).toBeInTheDocument()
  })

  it("says in words when a picked starter repeats the main's protein", () => {
    pick('pork-chops-apple-onion', 'san-choy-bau')
    renderList()
    expect(
      menu().getByText(
        /Check: San choy bau repeats a main ingredient of Pork chops/
      )
    ).toBeInTheDocument()
    expect(menu().queryByText(/is heavy next to/)).toBeNull()
  })

  it('does not flag a light starter next to a light main', () => {
    pick('lemongrass-beef-noodle-salad', 'greek-salad-haloumi')
    renderList()
    expect(menu().queryByText(/Check:/)).toBeNull()
    expect(menu().getByText('2 courses picked')).toBeInTheDocument()
  })

  it('collapses to its header on a phone, like the other sections', () => {
    setViewportWidth(390)
    pick('butter-chicken')
    renderList()
    const header = screen.getByRole('button', { name: /^Menu/ })
    expect(header).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Starter' })
    ).toBeNull()
  })

  it('words both clashes, including a heavy starter no library recipe causes yet', () => {
    expect(CLASH_REASON.protein('San choy bau', 'Pork chops')).toBe(
      'San choy bau repeats a main ingredient of Pork chops.'
    )
    expect(CLASH_REASON.heavy('Korma', 'Salad')).toBe(
      'Korma is heavy next to Salad.'
    )
  })

  it('has no axe violations', async () => {
    pick('butter-chicken')
    const { container } = renderList()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('WineLine', () => {
  it('shows nothing for a recipe nobody has described', () => {
    const { container } = render(
      <WineLine recipe={{ ...recipeById('dahl'), id: 'nobody-wrote-this' }} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
