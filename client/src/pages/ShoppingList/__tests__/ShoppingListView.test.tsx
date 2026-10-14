import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { library } from '../../../utils/library/recipeLibrary'
import { VIEW_KEY } from '../../../utils/storage/shoppingState'
import { ShoppingListView, tapLabel } from '../ShoppingListView'

const pick = (...ids: string[]) => library.filter((r) => ids.includes(r.id))

const renderView = (ids: string[]) =>
  render(
    <MemoryRouter>
      <ShoppingListView recipes={pick(...ids)} />
    </MemoryRouter>
  )

const tapButton = () => screen.getByRole('link', { name: /^Tap \d+ items?$/ })
const tapCount = () => Number(tapButton().textContent?.match(/\d+/)?.[0])

describe('tapLabel', () => {
  it('pluralises', () => {
    expect(tapLabel(1)).toBe('Tap 1 item')
    expect(tapLabel(3)).toBe('Tap 3 items')
  })
})

describe('ShoppingListView', () => {
  beforeEach(() => localStorage.clear())

  it('asks for saved recipes when there are none', () => {
    renderView([])
    expect(screen.getByText(/save a recipe or two/i)).toBeInTheDocument()
  })

  it('groups by home location and moves ticked items to Already have', () => {
    renderView(['butter-chicken', 'dahl'])
    expect(screen.getByRole('region', { name: 'Fridge' })).toBeInTheDocument()
    const onion = screen.getAllByRole('checkbox', { name: /onion/i })[0]
    expect(onion).toBeDefined()
    expect(
      screen.getAllByText('for butter chicken and red lentil dahl').length
    ).toBeGreaterThan(0)
    const before = tapCount()
    fireEvent.click(onion ?? document.body)
    expect(tapCount()).toBe(before - 1)

    const have = screen.getByRole('button', { name: /Already have/ })
    expect(have).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(have)
    expect(screen.getByText(/We assumed you have these/)).toBeInTheDocument()
    const back = screen.getAllByRole('checkbox', {
      name: /onion/i,
      checked: true
    })[0]
    fireEvent.click(back ?? document.body)
    expect(tapCount()).toBe(before)
  })

  it('moves an item to another home location from the expanded row', () => {
    renderView(['dahl'])
    expect(screen.getByText('Tick what you already have')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Check your kitchen' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /is kept in/ })
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getAllByRole('button', { name: /^Details for/ })[0] ??
        document.body
    )
    const move = within(screen.getByRole('group', { name: /^Move .* to$/ }))
    expect(move.getAllByRole('button')).toHaveLength(4)
    fireEvent.click(move.getByRole('button', { name: 'Bench' }))
    expect(move.getAllByRole('button', { pressed: true })).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'Bench' })).toBeInTheDocument()
  })

  it('changes a location from the chip menu at the shop', () => {
    renderView(['dahl'])
    fireEvent.click(screen.getByRole('radio', { name: 'At the shop' }))
    expect(screen.getByRole('heading', { name: 'To buy' })).toBeInTheDocument()
    const chip = screen.getAllByRole('button', {
      name: /is kept in .*\. Change/
    })[0]
    fireEvent.click(chip ?? document.body)
    const menu = screen.getByRole('menu')
    expect(within(menu).getAllByRole('menuitemradio')).toHaveLength(4)
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: 'Bench' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /is kept in Bench/ }).length
    ).toBeGreaterThan(0)

    fireEvent.click(
      screen.getAllByRole('button', { name: /is kept in/ })[0] ?? document.body
    )
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    fireEvent.click(
      screen.getAllByRole('button', { name: /is kept in/ })[0] ?? document.body
    )
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'a' })
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('shop view groups by section with pantry aisles and strikes ticks in place', () => {
    renderView(['butter-chicken', 'dahl'])
    fireEvent.click(screen.getByRole('radio', { name: 'At the shop' }))
    expect(localStorage.getItem(VIEW_KEY)).toBe('"shop"')
    const pantry = screen.getByRole('region', { name: 'Pantry' })
    expect(
      within(pantry).getAllByRole('heading', { level: 4 }).length
    ).toBeGreaterThan(0)
    const before = tapCount()
    const box = screen.getAllByRole('checkbox', { checked: false })[0]
    fireEvent.click(box ?? document.body)
    expect(box).toBeChecked()
    expect(box?.closest('li')).toHaveClass('list-row--done')
    expect(tapCount()).toBe(before)
    fireEvent.click(screen.getByRole('button', { name: /Already have/ }))
    expect(
      screen.getAllByRole('checkbox', { checked: true }).length
    ).toBeGreaterThan(1)
  })

  it('expands a breakdown and rescales with people', () => {
    renderView(['butter-chicken', 'dahl'])
    const more = screen.getAllByRole('button', { name: /^Details for/ })[0]
    fireEvent.click(more ?? document.body)
    expect(more).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/in total$/)).toBeInTheDocument()
    const total = screen.getByText(/in total$/).textContent
    fireEvent.click(screen.getByRole('radio', { name: '3' }))
    expect(screen.getByText(/in total$/).textContent).not.toBe(total)
  })

  it('says when nothing is left to buy', () => {
    renderView(['dahl'])
    const boxes = screen.getAllByRole('checkbox')
    boxes.forEach((box) => fireEvent.click(box))
    expect(screen.getByText(/Nothing to buy/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^Tap/ })).not.toBeInTheDocument()
  })
})
