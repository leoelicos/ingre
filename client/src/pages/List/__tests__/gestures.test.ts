import '@testing-library/jest-dom'
import {
  capturePointer,
  classifySwipe,
  escapeAction,
  focusFirstInput,
  focusableIn,
  openerFrom,
  rowScroll,
  sheetShouldClose,
  tabTarget,
  trapTarget
} from '../gestures'

describe('swipe and sheet gestures (#192)', () => {
  it('deletes a long horizontal drag that did not scroll the row', () => {
    expect(classifySwipe({ dx: -120, dy: 10, scrollDelta: 0 })).toBe('delete')
    expect(classifySwipe({ dx: 96, dy: 0, scrollDelta: 0 })).toBe('delete')
  })

  it('treats a short drag, a vertical drag, or a scrolled row as not a delete', () => {
    expect(classifySwipe({ dx: 40, dy: 4, scrollDelta: 0 })).toBe('pending')
    expect(classifySwipe({ dx: 20, dy: 80, scrollDelta: 0 })).toBe('scroll')
    expect(classifySwipe({ dx: 140, dy: 4, scrollDelta: 30 })).toBe('scroll')
    expect(classifySwipe({ dx: 140, dy: 4, scrollDelta: -9 })).toBe('scroll')
  })

  it('closes the sheet on a downward drag only', () => {
    expect(sheetShouldClose(80, 10)).toBe(true)
    expect(sheetShouldClose(80, 70)).toBe(false)
    expect(sheetShouldClose(40, 0)).toBe(false)
    expect(sheetShouldClose(-90, 0)).toBe(false)
  })
})

describe('focus trap (#192)', () => {
  const button = (disabled = false): HTMLButtonElement => {
    const el = document.createElement('button')
    if (disabled) el.setAttribute('disabled', 'true')
    document.body.appendChild(el)
    return el
  }

  afterEach(() => {
    document.body.replaceChildren()
  })

  it('skips disabled, tabindex -1 and hidden controls', () => {
    const ok = button()
    button(true)
    const skipped = button()
    skipped.setAttribute('tabindex', '-1')
    const blocked = document.createElement('span')
    blocked.tabIndex = 0
    blocked.setAttribute('disabled', 'true')
    document.body.appendChild(blocked)
    const hidden = document.createElement('div')
    hidden.hidden = true
    const inside = document.createElement('button')
    hidden.appendChild(inside)
    document.body.appendChild(hidden)
    expect(focusableIn(document.body)).toEqual([ok])
  })

  it('reads a scroller position, or 0 when the row is not in one', () => {
    const row = document.createElement('li')
    expect(rowScroll(row)).toBe(0)
    const scroller = document.createElement('ul')
    scroller.appendChild(row)
    expect(rowScroll(row)).toBe(0)
  })

  it('wraps Tab at either end and sends a lost focus back to the first', () => {
    expect(trapTarget([], null, false)).toBeNull()
    const only = button()
    expect(trapTarget([only], document.body, true)).toBe(only)
    const a = button()
    const b = button()
    const c = button()
    const items = [a, b, c]
    expect(trapTarget(items, a, true)).toBe(c)
    expect(trapTarget(items, c, false)).toBe(a)
    expect(trapTarget(items, b, false)).toBeNull()
    expect(trapTarget(items, b, true)).toBeNull()
    expect(trapTarget(items, document.body, false)).toBe(a)
    expect(trapTarget(items, null, false)).toBeNull()
  })
})

describe('pointer capture and dialog focus (#192)', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('captures a pointer, and ignores a missing or refusing element', () => {
    const el = document.createElement('div')
    const captured: number[] = []
    el.setPointerCapture = (id: number) => {
      captured.push(id)
    }
    capturePointer(el, 4)
    expect(captured).toEqual([4])
    el.setPointerCapture = () => {
      throw new Error('no pointer')
    }
    capturePointer(el, 4)
    Object.defineProperty(el, 'setPointerCapture', { value: undefined })
    capturePointer(el, 4)
  })

  it('remembers an element, and nothing else', () => {
    expect(openerFrom(document.body)).toBe(document.body)
    expect(openerFrom(null)).toBeNull()
    expect(openerFrom(document.createTextNode('x'))).toBeNull()
  })

  it('focuses the first input, and does nothing without one', () => {
    focusFirstInput(null)
    const empty = document.createElement('div')
    focusFirstInput(empty)
    const input = document.createElement('input')
    empty.appendChild(input)
    document.body.appendChild(empty)
    focusFirstInput(empty)
    expect(input).toHaveFocus()
  })

  it('sends Tab nowhere when there is no dialog', () => {
    expect(tabTarget(null, null, false)).toBeNull()
    const root = document.createElement('div')
    const only = document.createElement('button')
    root.appendChild(only)
    expect(tabTarget(root, only, false)).toBe(only)
  })

  it('lets Escape close only when nothing nested wants it', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    expect(escapeAction(null, null)).toBe('ignore')
    expect(escapeAction(root, null)).toBe('close')
    const list = document.createElement('div')
    list.setAttribute('role', 'listbox')
    document.body.appendChild(list)
    expect(escapeAction(root, null)).toBe('ignore')
    list.remove()
    const input = document.createElement('input')
    input.value = 'beef'
    expect(escapeAction(root, input)).toBe('ignore')
    input.value = ''
    expect(escapeAction(root, input)).toBe('close')
    const plus = document.createElement('button')
    plus.id = 'add-ingredient'
    plus.setAttribute('aria-expanded', 'true')
    root.appendChild(plus)
    expect(escapeAction(root, null)).toBe('ignore')
    plus.setAttribute('aria-expanded', 'false')
    expect(escapeAction(root, null)).toBe('close')
  })
})
