import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import { resetViewport, setViewportWidth } from '../../../test/media'
import { pick, region, renderList, searchBox } from '../../../test/renderList'
import { SPLIT_KEY } from '../../../utils/layout/split'
import { HIDE_EXPLORE } from '../Explore'

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
  screen.queryAllByRole('button', { name: /^(Ingredients|Recipes|Extra)/ })
const drawer = () =>
  screen.queryByRole('complementary', { name: 'Explore drawer' })

describe('Scenario: Mobile first, vertical below 576px (#181)', () => {
  it('stacks the sections, offers no layout toggle, and keeps the collapse buttons, Extra too (#182, answer 15)', () => {
    setViewportWidth(575)
    renderList()
    expect(layout()).toBeNull()
    expect(grid()).toHaveAttribute('data-split', 'vertical')
    expect(grid()).toHaveClass('grid-cols-1')
    expect(sectionHeaderButtons()).toHaveLength(3)
    const extra = screen.getByRole('button', { name: /^Extra/ })
    fireEvent.click(extra)
    expect(extra).toHaveAttribute('aria-expanded', 'false')
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
    expect(sectionHeaderButtons()).toHaveLength(3)
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

const exploreHeader = () => screen.getByRole('button', { name: /^Explore/ })
const banner = () => within(screen.getByRole('banner'))
const column = () =>
  document.querySelector<HTMLElement>('[data-explore-column]')
const THIRDS = 'Ingredients 33%, Recipes 33%, Explore 33%'
const rail = () =>
  screen.getByRole('button', { name: 'Search ingredients and recipes' })

describe('Scenario: Explore inline below 1328px (#181)', () => {
  it('at 1327px Explore is inline above the sections and the search bar stays in the header', () => {
    setViewportWidth(1327)
    renderList()
    expect(drawer()).toBeNull()
    expect(banner().getByRole('searchbox')).toBe(searchBox())
    const main = screen.getByRole('main')
    expect(within(main).getByRole('region', { name: 'Explore' })).toBe(
      region('Explore')
    )
    expect(
      region('Explore').compareDocumentPosition(region('Ingredients')) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('at 1327px the toggle offers four splits, not 33/33/33', () => {
    setViewportWidth(1327)
    renderList()
    expect(choices()).toEqual([
      'Vertical',
      'Ingredients 50%, Recipes 50%',
      'Ingredients 25%, Recipes 75%',
      'Ingredients 75%, Recipes 25%'
    ])
  })
})

describe('Scenario: Explore drawer from 1328px (#181)', () => {
  it('is a push column on the right holding the search bar; the split uses the space left', () => {
    setViewportWidth(1328)
    renderList()
    const aside = drawer()
    expect(aside).toHaveClass('w-[360px]', 'shrink-0')
    expect(aside?.className).not.toMatch(/\b(absolute|fixed)\b/)
    expect(within(aside ?? document.body).getByRole('searchbox')).toBe(
      searchBox()
    )
    expect(banner().queryByRole('searchbox')).toBeNull()
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

  it('X shrinks it to a strip, focused, whose search button expands it and focuses the search box; Explore stays mounted', () => {
    setViewportWidth(1328)
    renderList()
    fireEvent.click(screen.getByRole('button', { name: HIDE_EXPLORE }))
    expect(drawer()).toHaveClass('w-14')
    expect(document.getElementById('explore')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Explore' })).toBeNull()
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(rail()).toHaveFocus()
    expect(rail()).toHaveAttribute('aria-expanded', 'false')
    expect(rail()).toHaveAttribute('aria-controls', 'explore-drawer-content')
    fireEvent.click(rail())
    expect(drawer()).toHaveClass('w-[360px]')
    expect(searchBox()).toHaveFocus()
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
  })

  it('starts as the strip when something is selected, with Explore still mounted', () => {
    setViewportWidth(1328)
    pick('dahl')
    renderList()
    expect(drawer()).toHaveClass('w-14')
    expect(document.getElementById('explore')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Explore' })).toBeNull()
  })

  it('the header search shows on other pages at wide widths', () => {
    setViewportWidth(1328)
    renderList('/elsewhere')
    expect(banner().getByRole('searchbox')).toBeInTheDocument()
  })

  it('its header row collapses it to the strip as well', () => {
    setViewportWidth(1328)
    renderList()
    fireEvent.click(exploreHeader())
    expect(drawer()).toHaveClass('w-14')
    expect(rail()).toHaveFocus()
  })

  it('moves inline when the window shrinks to 1327px, and back when it grows', () => {
    setViewportWidth(1328)
    renderList()
    setViewportWidth(1327)
    expect(drawer()).toBeNull()
    expect(banner().getByRole('searchbox')).toBe(searchBox())
    expect(region('Explore')).toBeVisible()
    setViewportWidth(1328)
    expect(drawer()).not.toBeNull()
    expect(banner().queryByRole('searchbox')).toBeNull()
  })
})

describe('Scenario: 33/33/33 from 1328px', () => {
  it('is offered next to 25/75 and makes Explore the third equal column, with the search bar above it', () => {
    setViewportWidth(1328)
    pick('dahl')
    renderList()
    expect(choices()).toEqual([
      'Vertical',
      'Ingredients 50%, Recipes 50%',
      'Ingredients 25%, Recipes 75%',
      THIRDS,
      'Ingredients 75%, Recipes 25%'
    ])
    expect(
      screen.getByRole('radio', { name: THIRDS }).closest('label')
    ).toHaveTextContent('33/33/33')
    choose(THIRDS)
    expect(localStorage.getItem(SPLIT_KEY)).toBe('"33/33/33"')
    expect(grid()).toHaveAttribute('data-split', '33/33/33')
    expect(grid()).toHaveClass(
      'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
    )
    expect(drawer()).toBeNull()
    expect(banner().queryByRole('searchbox')).toBeNull()
    const third = column()
    expect(grid().lastElementChild).toBe(third)
    expect(Array.from(grid().children)).toHaveLength(3)
    expect(grid().firstElementChild).toBe(region('Ingredients'))
    expect(grid().children[1]).toContainElement(region('Extra'))
    expect(
      within(third ?? document.body).getByRole('searchbox')
    ).toBeInTheDocument()
    // choosing it shows Explore, expanded
    expect(
      within(third ?? document.body).getByRole('region', { name: 'Explore' })
    ).toBeVisible()
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
  })

  it('in the column, X collapses Explore to its header row, which expands it again', () => {
    setViewportWidth(1328)
    renderList()
    choose(THIRDS)
    fireEvent.click(screen.getByRole('button', { name: HIDE_EXPLORE }))
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'false')
    expect(exploreHeader()).toHaveFocus()
    expect(column()).not.toBeNull()
    expect(region('Explore')).toBeVisible()
    fireEvent.click(exploreHeader())
    expect(exploreHeader()).toHaveAttribute('aria-expanded', 'true')
  })

  it('a saved 33/33/33 shows as 50/50 at 1327px and comes back at 1328px, and after a refresh', () => {
    setViewportWidth(1328)
    const first = renderList()
    choose(THIRDS)
    setViewportWidth(1327)
    expect(grid()).toHaveAttribute('data-split', '50/50')
    expect(
      screen.getByRole('radio', { name: 'Ingredients 50%, Recipes 50%' })
    ).toBeChecked()
    expect(column()).toBeNull()
    expect(region('Explore')).toBeVisible()
    expect(banner().getByRole('searchbox')).toBe(searchBox())
    setViewportWidth(1328)
    expect(grid()).toHaveAttribute('data-split', '33/33/33')
    expect(column()).not.toBeNull()
    first.unmount()
    setViewportWidth(1327)
    renderList()
    expect(grid()).toHaveAttribute('data-split', '50/50')
    setViewportWidth(1328)
    expect(grid()).toHaveAttribute('data-split', '33/33/33')
  })

  it('choosing another split moves Explore back to the drawer', () => {
    setViewportWidth(1328)
    renderList()
    choose(THIRDS)
    choose('Ingredients 50%, Recipes 50%')
    expect(column()).toBeNull()
    expect(drawer()).toHaveClass('w-[360px]')
  })
})
