import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import { isKeyboardOpen, useKeyboardOpen } from '../keyboard'

const Probe = () => (
  <output aria-label="keyboard">{String(useKeyboardOpen())}</output>
)

/** A visual viewport whose height a test can change, announcing each change like a browser. */
class FakeViewport extends EventTarget {
  height = 800
  resizeTo(height: number) {
    this.height = height
    this.dispatchEvent(new Event('resize'))
  }
}

const install = (viewport: FakeViewport | null) =>
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: viewport
  })

describe('isKeyboardOpen', () => {
  it('is true only when the visible area is much shorter than the page', () => {
    expect(isKeyboardOpen(800, 800)).toBe(false)
    expect(isKeyboardOpen(800, 700)).toBe(false)
    expect(isKeyboardOpen(800, 450)).toBe(true)
  })
})

describe('useKeyboardOpen', () => {
  afterEach(() => install(null))

  it('is false where there is no visual viewport', () => {
    install(null)
    render(<Probe />)
    expect(screen.getByLabelText('keyboard')).toHaveTextContent('false')
  })

  it('follows the visual viewport, and stops listening on unmount', () => {
    const viewport = new FakeViewport()
    install(viewport)
    window.innerHeight = 800
    const { unmount } = render(<Probe />)
    act(() => viewport.resizeTo(420))
    expect(screen.getByLabelText('keyboard')).toHaveTextContent('true')
    act(() => viewport.resizeTo(800))
    expect(screen.getByLabelText('keyboard')).toHaveTextContent('false')
    const remove = jest.spyOn(viewport, 'removeEventListener')
    unmount()
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
