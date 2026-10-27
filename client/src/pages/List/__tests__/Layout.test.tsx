import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { resetViewport, setViewportWidth } from '../../../test/media'
import {
  explore,
  hasChipEl,
  pick,
  pickedIds,
  recipes,
  region,
  renderList,
  sheet,
  storedCopies
} from '../../../test/renderList'
import { COPIES_KEY } from '../../../utils/storage/shoppingState'

/* #192: one workspace. Recipes above Ingredients below 576px, side by side from there. */

beforeEach(() => localStorage.clear())
afterEach(resetViewport)

const workspace = () => {
  const found = document.querySelector<HTMLElement>('[data-workspace]')
  if (found === null) throw new Error('no workspace')
  return found
}
const tick = (title: string) => recipes().getByRole('button', { name: title })
const card = (title: string) => {
  const found = tick(title).closest('li')
  if (found === null) throw new Error(`no card ${title}`)
  return found
}
/**
 * A pointer event at a point. jsdom has no PointerEvent, and its plain Event drops the
 * coordinates, so this sends a MouseEvent under the pointer event's name, which React reads.
 */
const pointer = (el: Element, type: string, x = 0, y = 0) =>
  fireEvent(
    el,
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    })
  )
/** A pointer drag from (100, 300) by (dx, dy), let go there. */
const drag = (el: Element, dx: number, dy: number) => {
  pointer(el, 'pointerdown', 100, 300)
  pointer(el, 'pointermove', 100 + dx, 300 + dy)
  pointer(el, 'pointerup', 100 + dx, 300 + dy)
}
const note = () => screen.queryByText(/^Removed /)

describe('Scenario: Phase 1, one page, no accordions (#192)', () => {
  it.each([575, 576])(
    'at %ipx Recipes comes first, then Ingredients, in one grid that splits 50/50 from 576px',
    (width) => {
      setViewportWidth(width)
      renderList()
      const [first, second] = Array.from(workspace().children)
      expect(first).toBe(region('Recipes'))
      expect(second).toBe(region('Ingredients'))
      expect(workspace()).toHaveClass('grid-cols-1', 'desk:grid-cols-2')
      expect(screen.queryByRole('radiogroup', { name: 'Layout' })).toBeNull()
      expect(screen.queryByRole('search')).toBeNull()
      expect(document.getElementById('explore')).toBeNull()
    }
  )
})

describe('Scenario: Phase 2, the mobile recipe row (#192)', () => {
  it('is a sideways scroll-snap row below 576px that becomes a column from 576px', () => {
    pick('dahl', 'butter-chicken')
    renderList()
    const list = card('Red lentil dahl').parentElement
    expect(list).toHaveClass(
      'flex',
      'snap-x',
      'snap-mandatory',
      'overflow-x-auto',
      'desk:grid',
      'desk:grid-cols-1'
    )
    expect(card('Red lentil dahl')).toHaveClass(
      'w-[85%]',
      'shrink-0',
      'snap-start',
      'max-h-[calc(100dvh-22rem)]',
      'overflow-y-auto',
      'desk:max-h-none',
      'desk:overflow-visible',
      'desk:w-auto'
    )
    const names = card('Red lentil dahl').querySelector(
      '[data-testid="ingredient-names"]'
    )
    expect(names).toHaveClass('flex-nowrap', 'overflow-x-auto')
    expect(names).toHaveAttribute('tabindex', '0')
    expect(names?.querySelector('li')).toHaveClass('shrink-0')
  })
})

describe('Scenario: Swipe to delete with Undo (#192)', () => {
  it('below 576px a card swiped up past the threshold leaves, with a note whose Undo puts it back where it was', async () => {
    setViewportWidth(575)
    pick('dahl', 'butter-chicken')
    renderList()
    expect(card('Red lentil dahl')).toHaveAttribute('data-swipeable', 'true')
    expect(card('Red lentil dahl')).toHaveClass('touch-pan-x')
    drag(card('Red lentil dahl'), 0, -120)
    expect(pickedIds()).toEqual(['butter-chicken'])
    expect(hasChipEl('red-lentils')).toBe(0)
    expect(note()).toHaveTextContent('Removed Red lentil dahl')
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).toHaveFocus())
    fireEvent.click(undo)
    expect(pickedIds()).toEqual(['dahl', 'butter-chicken'])
    expect(note()).toBeNull()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 2, name: 'Recipes' })
      ).toHaveFocus()
    )
  })

  it('keeps its edits through Undo', () => {
    setViewportWidth(575)
    const copies = [
      { recipeId: 'dahl', portions: 4, amounts: { butter: 30 } },
      { recipeId: 'butter-chicken', portions: 2, amounts: {} }
    ]
    localStorage.setItem(COPIES_KEY, JSON.stringify(copies))
    renderList()
    drag(card('Red lentil dahl'), 0, -120)
    expect(storedCopies()).toEqual([copies[1]])
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(storedCopies()).toEqual(copies)
  })

  it('below 576px a swipe left, a short swipe or a mostly sideways one keeps the card', () => {
    setViewportWidth(575)
    pick('dahl')
    renderList()
    drag(card('Red lentil dahl'), -200, 0)
    drag(card('Red lentil dahl'), 0, -60)
    drag(card('Red lentil dahl'), 150, -100)
    drag(card('Red lentil dahl'), 0, 150)
    expect(pickedIds()).toEqual(['dahl'])
    expect(note()).toBeNull()
  })

  it('from 576px a row swiped left (mouse, pen or touch) leaves; up does not', () => {
    setViewportWidth(576)
    pick('dahl', 'butter-chicken')
    renderList()
    expect(card('Butter chicken')).toHaveClass('touch-pan-y')
    expect(
      card('Butter chicken').querySelector('[data-testid="ingredient-names"]')
    ).toHaveClass('flex-wrap')
    expect(
      card('Butter chicken').querySelector('[data-testid="ingredient-names"]')
    ).not.toHaveAttribute('tabindex')
    expect(
      card('Butter chicken').querySelector(
        '[data-testid="ingredient-names"] li'
      )
    ).not.toHaveClass('shrink-0')
    drag(card('Butter chicken'), 0, -200)
    expect(pickedIds()).toEqual(['dahl', 'butter-chicken'])
    drag(card('Butter chicken'), -130, 10)
    expect(pickedIds()).toEqual(['dahl'])
    expect(note()).toHaveTextContent('Removed Butter chicken')
  })

  it('follows the pointer while dragged, fading, and snaps back on cancel', () => {
    setViewportWidth(576)
    pick('dahl')
    renderList()
    const row = card('Red lentil dahl')
    pointer(row, 'pointerdown', 300, 100)
    // within the slop it is still a press
    pointer(row, 'pointermove', 295, 100)
    expect(row.style.transform).toBe('translateX(-5px)')
    pointer(row, 'pointermove', 240, 100)
    expect(row.style.transform).toBe('translateX(-60px)')
    expect(Number(row.style.opacity)).toBeLessThan(1)
    pointer(row, 'pointercancel')
    expect(row.style.transform).toBe('')
    expect(row.style.opacity).toBe('')
    // moves after a cancel are not a drag
    pointer(row, 'pointermove', 100, 100)
    expect(row.style.transform).toBe('')
  })

  it('a drag is never also a tap on the tick; a tap still unpicks', () => {
    setViewportWidth(576)
    pick('dahl')
    renderList()
    const row = card('Red lentil dahl')
    pointer(row, 'pointerdown', 300, 100)
    pointer(row, 'pointermove', 260, 100)
    pointer(row, 'pointerup', 260, 100)
    fireEvent.click(tick('Red lentil dahl'))
    expect(pickedIds()).toEqual(['dahl'])
    // a key press is never a drag
    fireEvent.keyDown(tick('Red lentil dahl'), { key: 'Tab' })
    fireEvent.click(tick('Red lentil dahl'))
    expect(pickedIds()).toEqual([])
  })

  it('an open recipe is not swiped, and Dismiss closes the note', async () => {
    setViewportWidth(575)
    pick('dahl', 'butter-chicken')
    renderList()
    fireEvent.click(
      recipes().getByRole('button', { name: 'Red lentil dahl details' })
    )
    expect(card('Red lentil dahl')).toHaveAttribute('data-swipeable', 'false')
    drag(card('Red lentil dahl'), 0, -200)
    expect(pickedIds()).toEqual(['dahl', 'butter-chicken'])
    drag(card('Butter chicken'), 0, -200)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(note()).toBeNull()
    expect(pickedIds()).toEqual(['dahl'])
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 2, name: 'Recipes' })
      ).toHaveFocus()
    )
  })

  it('Explore rows never swipe', () => {
    setViewportWidth(575)
    renderList()
    const row = explore()
      .getByRole('button', { name: 'Red lentil dahl' })
      .closest('li')
    if (row === null) throw new Error('no Explore row')
    expect(row).not.toHaveAttribute('data-swipeable', 'true')
    expect(row.className).not.toMatch(/touch-pan/)
  })
})

describe('Scenario: Phase 4, swipe the sheet down to close it below 576px (#192)', () => {
  const grip = () => {
    const found = document.querySelector<HTMLElement>('[data-sheet-grip]')
    if (found === null) throw new Error('no grip')
    return found
  }
  it('closes on a swipe down from its top bar, follows the finger, and a short one keeps it', () => {
    setViewportWidth(575)
    renderList()
    explore()
    pointer(grip(), 'pointerdown', 100, 100)
    pointer(grip(), 'pointermove', 100, 150)
    const panel = screen.getByRole('dialog', { name: 'Explore' }).parentElement
    expect(panel?.style.transform).toBe('translateY(50px)')
    pointer(grip(), 'pointerup', 100, 150)
    expect(sheet('Explore')).toBeInTheDocument()
    drag(grip(), 0, 120)
    expect(sheet('Explore')).toBeNull()
  })

  it('from 576px it is a centred modal that does not swipe; its grip bar is hidden', () => {
    setViewportWidth(576)
    renderList()
    explore()
    const bar = within(grip()).getByText('', {
      selector: 'span[aria-hidden="true"]'
    })
    expect(bar).toHaveClass('desk:hidden')
    drag(grip(), 0, 200)
    expect(sheet('Explore')).toBeInTheDocument()
  })
})
