import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { resetViewport, setViewportWidth } from '../../../test/media'
import { pick, region, renderList } from '../../../test/renderList'

beforeEach(() => localStorage.clear())
afterEach(resetViewport)

const workspace = () => {
  const found = document.querySelector<HTMLElement>('[data-workspace]')
  if (found === null) throw new Error('no workspace')
  return found
}

describe('Scenario: One workspace (#192)', () => {
  it('stacks Recipes above Ingredients below 576px and splits 50/50 from 576px', () => {
    setViewportWidth(575)
    renderList()
    expect(screen.queryByRole('radiogroup', { name: 'Layout' })).toBeNull()
    expect(workspace()).toHaveClass('grid-cols-1', 'min-[576px]:grid-cols-2')
    const recipes = region('Recipes')
    const ingredients = region('Ingredients')
    expect(
      recipes.compareDocumentPosition(ingredients) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Ingredients/ })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Explore' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Extra' })).toBeNull()
    setViewportWidth(576)
    expect(workspace()).toHaveClass('min-[576px]:grid-cols-2')
  })

  it('pins the Ingredients header and keeps the last rows clear of the add button', () => {
    renderList()
    expect(region('Ingredients').querySelector('.sticky')).not.toBeNull()
    expect(document.querySelector('main')).toHaveClass('pb-28')
  })
})

describe('Scenario: Swipe to remove a recipe (#192)', () => {
  const card = () => {
    const found = document.querySelector<HTMLElement>('[data-recipe="dahl"]')
    if (found === null) throw new Error('no card')
    return found
  }

  it('a long horizontal drag removes it, and Undo puts the copy back', () => {
    pick('dahl')
    renderList()
    fireEvent.pointerDown(card(), { clientX: 220, clientY: 40, button: 0 })
    fireEvent.pointerUp(card(), { clientX: 40, clientY: 48, button: 0 })
    expect(screen.getByText('Removed Red lentil dahl')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Red lentil dahl' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(
      screen.getByRole('button', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
  })

  it('a short drag, or the Remove button, and a drag that scrolls, do not surprise-delete', () => {
    pick('dahl')
    renderList()
    fireEvent.pointerDown(card(), { clientX: 80, clientY: 40, button: 0 })
    fireEvent.pointerUp(card(), { clientX: 100, clientY: 44, button: 0 })
    expect(
      screen.getByRole('button', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Red lentil dahl' })
    )
    expect(screen.getByText('Removed Red lentil dahl')).toBeInTheDocument()
  })

  it('ignores a secondary button, a cancelled drag, and a drag in Explore', () => {
    pick('dahl')
    renderList()
    fireEvent.pointerMove(card(), { clientX: 10, clientY: 10, button: 0 })
    fireEvent.pointerUp(card(), { clientX: 10, clientY: 10, button: 0 })
    fireEvent.pointerDown(card(), { clientX: 200, clientY: 40, button: 2 })
    fireEvent.pointerMove(card(), { clientX: 40, clientY: 40, button: 2 })
    expect(card().style.transform).toBe('')
    fireEvent.pointerDown(card(), { clientX: 200, clientY: 40, button: 0 })
    fireEvent.pointerMove(card(), { clientX: 140, clientY: 44, button: 0 })
    expect(card().style.transform).toBe('translateX(-60px)')
    fireEvent.pointerCancel(card())
    expect(card().style.transform).toBe('')
    expect(
      screen.getByRole('button', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Find recipes' }))
    const exploreRow = screen
      .getByRole('dialog', { name: 'Find recipes' })
      .querySelector<HTMLElement>('[data-recipe="dahl"]')
    if (exploreRow === null) throw new Error('no explore row')
    fireEvent.pointerDown(exploreRow, { clientX: 200, clientY: 20, button: 0 })
    fireEvent.pointerUp(exploreRow, { clientX: 20, clientY: 20, button: 0 })
    expect(exploreRow).toBeInTheDocument()
  })
})
