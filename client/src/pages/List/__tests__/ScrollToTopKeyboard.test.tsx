import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import {
  installViewport,
  removeViewport,
  setKeyboard
} from '../../../test/keyboard'
import { ScrollToTop } from '../ScrollToTop'

/* #228: the floating button collapses while the keyboard is up. */

let fire: () => void = () => {}
class FakeObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly scrollMargin = ''
  readonly thresholds = []
  constructor(callback: IntersectionObserverCallback) {
    fire = () =>
      act(() =>
        callback(
          [
            {
              isIntersecting: false,
              boundingClientRect: new DOMRect(0, -50),
              intersectionRatio: 0,
              intersectionRect: new DOMRect(),
              rootBounds: null,
              target: document.body,
              time: 0
            }
          ],
          this
        )
      )
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

describe('Scroll to top and the keyboard (#228)', () => {
  it('shows once the chips are scrolled past, collapses while the keyboard is up, and returns', () => {
    window.IntersectionObserver = FakeObserver
    installViewport()
    render(
      <>
        <div id="watched" />
        <ScrollToTop
          watchId="watched"
          headingId="nothing"
        />
      </>
    )
    fire()
    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument()
    setKeyboard(true)
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull()
    setKeyboard(false)
    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument()
    removeViewport()
  })
})
