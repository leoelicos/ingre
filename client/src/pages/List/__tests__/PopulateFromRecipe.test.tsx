import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { library } from '../../../utils/library/recipeLibrary'
import {
  explore,
  pickedIds,
  recipes,
  renderList
} from '../../../test/renderList'
import { installPointerEvent } from '../../../test/pointer'
import { pickOnce } from '../Explore'

/*
 * #229: a compact "From a recipe" control beside Filter fills the list from a recipe, and a
 * swipe right on an Explore row does the same. Both only ever add; neither un-picks.
 */

expect.extend(toHaveNoViolations)
beforeAll(installPointerEvent)
beforeEach(() => localStorage.clear())

const DAHL = 'Red lentil dahl'
const rowOf = (name: string): HTMLElement => {
  const row = explore().getByRole('button', { name }).closest('li')
  if (row === null) throw new Error(`no row ${name}`)
  return row
}
const swipe = (row: HTMLElement, dx: number, dy = 0, pointerType = 'touch') => {
  fireEvent.pointerDown(row, { pointerType, clientX: 50, clientY: 50 })
  fireEvent.pointerUp(row, { pointerType, clientX: 50 + dx, clientY: 50 + dy })
}

describe('From a recipe', () => {
  it('is a compact menu button beside Filter, not a full-width button', () => {
    renderList()
    const toolbar = explore().getByRole('toolbar', { name: 'Explore actions' })
    const button = within(toolbar).getByRole('button', {
      name: 'From a recipe'
    })
    expect(button).toHaveAttribute('aria-haspopup', 'true')
    expect(button.className).not.toMatch(/\bw-full\b/)
    expect(
      within(toolbar).getByRole('button', { name: /^Filter/ })
    ).toBeVisible()
  })

  it('lists every recipe and picking one fills Recipes and Ingredients', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(explore().getByRole('button', { name: 'From a recipe' }))
    const menu = screen.getByRole('menu', { name: 'From a recipe' })
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(library.length)
    await user.click(within(menu).getByRole('menuitem', { name: DAHL }))
    expect(pickedIds()).toEqual(['dahl'])
    expect(recipes().getByRole('button', { name: DAHL })).toBeVisible()
  })

  it('shows a picked recipe as added and cannot choose it again', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(explore().getByRole('button', { name: 'From a recipe' }))
    await user.click(screen.getByRole('menuitem', { name: DAHL }))
    await user.click(explore().getByRole('button', { name: 'From a recipe' }))
    const added = screen.getByRole('menuitem', { name: `✓ ${DAHL}` })
    expect(added).toHaveAttribute('aria-disabled', 'true')
    await user.click(added)
    expect(pickedIds()).toEqual(['dahl'])
  })

  it('has no accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderList()
    await user.click(explore().getByRole('button', { name: 'From a recipe' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('swipe right on an Explore row', () => {
  it('picks the recipe', () => {
    renderList()
    swipe(rowOf(DAHL), 120)
    expect(pickedIds()).toEqual(['dahl'])
  })

  it('does not pick it a second time', () => {
    renderList()
    swipe(rowOf(DAHL), 120)
    swipe(rowOf(DAHL), 120)
    expect(pickedIds()).toEqual(['dahl'])
  })

  it('ignores a short swipe, a vertical scroll and a mouse drag', () => {
    renderList()
    swipe(rowOf(DAHL), 20)
    swipe(rowOf(DAHL), 120, 200)
    swipe(rowOf(DAHL), 120, 0, 'mouse')
    expect(pickedIds()).toEqual([])
  })

  it('ignores a cancelled touch', () => {
    renderList()
    const row = rowOf(DAHL)
    fireEvent.pointerDown(row, {
      pointerType: 'touch',
      clientX: 50,
      clientY: 50
    })
    fireEvent.pointerCancel(row, { pointerType: 'touch' })
    fireEvent.pointerUp(row, {
      pointerType: 'touch',
      clientX: 200,
      clientY: 50
    })
    expect(pickedIds()).toEqual([])
  })

  it('lets rows scroll up and down (touch-pan-y) in Explore only', () => {
    localStorage.clear()
    renderList()
    expect(rowOf(DAHL).className).toContain('touch-pan-y')
  })

  it('does nothing on the Recipes rows, which have no swipe', () => {
    renderList()
    swipe(rowOf(DAHL), 120)
    const own = recipes().getByRole('button', { name: DAHL }).closest('li')
    expect(own?.className).not.toContain('touch-pan-y')
    if (own) swipe(own, 120)
    expect(pickedIds()).toEqual(['dahl'])
  })
})

describe('pickOnce', () => {
  const recipe = library[0]
  it('picks an unpicked recipe and leaves a picked one', () => {
    const picks: string[] = []
    const onTogglePicked = (r: { id: string }) => picks.push(r.id)
    if (recipe === undefined) throw new Error('no recipe')
    pickOnce({ pickedIds: new Set(), onTogglePicked }, recipe)
    pickOnce({ pickedIds: new Set([recipe.id]), onTogglePicked }, recipe)
    expect(picks).toEqual([recipe.id])
  })
})
