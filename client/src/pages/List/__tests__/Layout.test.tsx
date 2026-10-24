import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import { resetViewport, setViewportWidth } from '../../../test/media'
import { pick, region, renderList, searchBox } from '../../../test/renderList'
import { SPLIT_KEY } from '../../../utils/layout/split'
import { CLOSE_EXPLORE } from '../Explore'

beforeEach(() => localStorage.clear())
afterEach(resetViewport)

const layout = () => screen.queryByRole('radiogroup', { name: 'Layout' })
const choices = () =>
  within(screen.getByRole('radiogroup', { name: 'Layout' }))
    .getAllByRole('radio')
    .map((radio) => radio.getAttribute('aria-label'))
const choose = (name: string) =>
  fireEvent.click(screen.getByRole('radio', { name }))
const grid = () => {
  const found = document.querySelector<HTMLElement>('[data-split]')
  if (found === null) throw new Error('no split grid')
  return found
}
const sectionHeaderButtons = () =>
  screen.queryAllByRole('button', { name: /^(Ingredients|Recipes)/ })
const drawer = () =>
  screen.queryByRole('complementary', { name: 'Explore drawer' })

describe('Scenario: Mobile first, vertical below 576px (#181)', () => {
  it('stacks the sections, offers no layout toggle, and keeps the collapse buttons', () => {
    setViewportWidth(575)
    renderList()
    expect(layout()).toBeNull()
    expect(grid()).toHaveAttribute('data-split', 'vertical')
    expect(grid()).toHaveClass('grid-cols-1')
    expect(sectionHeaderButtons()).toHaveLength(2)
    expect(drawer()).toBeNull()
  })
})

describe('Scenario: Side by side from 576px (#181)', () => {
  it('is 50/50 by default, with a right-aligned toggle of Vertical and 50/50', () => {
    setViewportWidth(576)
    renderList()
    expect(grid()).toHaveAttribute('data-split', '50/50')
    expect(choices()).toEqual(['Vertical', 'Ingredients 50%, Recipes 50%'])
    expect(layout()).toHaveClass('justify-end')
    expect(
      screen.getByRole('radio', { name: 'Ingredients 50%, Recipes 50%' })
    ).toBeChecked()
    // above the sections
    expect(
      (layout()?.compareDocumentPosition(region('Ingredients')) ?? 0) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('side by side, the headers keep the outline but are plain headings with no button or chevron', () => {
    setViewportWidth(700)
    pick('dahl')
    renderList()
    expect(sectionHeaderButtons()).toHaveLength(0)
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Ingredients'
    })
    expect(heading.querySelector('svg')).toBeNull()
    expect(heading.firstElementChild).toHaveClass('shadow-raised')
    expect(region('Ingredients').querySelector('[data-chip]')).toBeVisible()
    choose('Vertical')
    expect(grid()).toHaveAttribute('data-split', 'vertical')
    expect(sectionHeaderButtons()).toHaveLength(2)
  })
})

describe('Scenario: All four splits from 992px (#181)', () => {
  it('adds 25/75 and 75/25; 25/75 gives Ingredients a quarter', () => {
    setViewportWidth(992)
    renderList()
    expect(choices()).toEqual([
      'Vertical',
      'Ingredients 50%, Recipes 50%',
      'Ingredients 25%, Recipes 75%',
      'Ingredients 75%, Recipes 25%'
    ])
    choose('Ingredients 25%, Recipes 75%')
    expect(grid()).toHaveClass('grid-cols-[minmax(0,1fr)_minmax(0,3fr)]')
    choose('Ingredients 75%, Recipes 25%')
    expect(grid()).toHaveAttribute('data-split', '75/25')
  })

  it('falls back to 50/50 below 992px and restores the choice when the window grows, and after a refresh', () => {
    setViewportWidth(1200)
    const first = renderList()
    choose('Ingredients 25%, Recipes 75%')
    expect(localStorage.getItem(SPLIT_KEY)).toBe('"25/75"')
    setViewportWidth(800)
    expect(grid()).toHaveAttribute('data-split', '50/50')
    expect(
      screen.getByRole('radio', { name: 'Ingredients 50%, Recipes 50%' })
    ).toBeChecked()
    setViewportWidth(500)
    expect(grid()).toHaveAttribute('data-split', 'vertical')
    setViewportWidth(1200)
    expect(grid()).toHaveAttribute('data-split', '25/75')
    first.unmount()
    renderList()
    expect(grid()).toHaveAttribute('data-split', '25/75')
  })
})

describe('Scenario: Explore drawer from 992px (#181)', () => {
  it('is a push column on the right holding the search bar; the split uses the space left', () => {
    setViewportWidth(1200)
    renderList()
    const aside = drawer()
    expect(aside).toHaveClass('w-[360px]', 'shrink-0')
    expect(aside?.className).not.toMatch(/\b(absolute|fixed)\b/)
    expect(within(aside ?? document.body).getByRole('searchbox')).toBe(
      searchBox()
    )
    expect(
      within(screen.getByRole('banner')).queryByRole('searchbox')
    ).toBeNull()
    expect(
      within(aside ?? document.body).getByRole('region', { name: 'Explore' })
    ).toBeVisible()
    // the main column comes first, then the drawer on the right
    const main = screen.getByRole('main')
    expect(main.nextElementSibling).toBe(aside)
    expect(
      within(main).getByRole('radiogroup', { name: 'Layout' })
    ).toBeVisible()
  })

  it('X shrinks it to a strip with a search button that reopens it and focuses the search box', () => {
    setViewportWidth(1200)
    renderList()
    fireEvent.click(screen.getByRole('button', { name: CLOSE_EXPLORE }))
    expect(drawer()).toHaveClass('w-14')
    expect(screen.queryByRole('region', { name: 'Explore' })).toBeNull()
    expect(screen.queryByRole('searchbox')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Search ingredients and recipes' })
    )
    expect(drawer()).toHaveClass('w-[360px]')
    expect(searchBox()).toHaveFocus()
  })

  it('starts as the strip when something is selected', () => {
    setViewportWidth(1200)
    pick('dahl')
    renderList()
    expect(drawer()).toHaveClass('w-14')
    expect(screen.queryByRole('region', { name: 'Explore' })).toBeNull()
  })

  it('the header search shows on other pages at wide widths', () => {
    setViewportWidth(1200)
    renderList('/elsewhere')
    expect(
      within(screen.getByRole('banner')).getByRole('searchbox')
    ).toBeInTheDocument()
  })

  it('collapses in the drawer as well', () => {
    setViewportWidth(1200)
    renderList()
    fireEvent.click(screen.getByRole('button', { name: /^Explore/ }))
    expect(screen.getByRole('button', { name: /^Explore/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(drawer()).toHaveClass('w-[360px]')
  })
})
