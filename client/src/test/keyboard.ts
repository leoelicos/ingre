import { act } from '@testing-library/react'

/**
 * A stand-in for the visual viewport (#228): jsdom has none. `setKeyboard(true)` shortens it as a
 * soft keyboard would, and tells every listener.
 */
class FakeViewport extends EventTarget {
  height = window.innerHeight
}

const viewport = new FakeViewport()

export const installViewport = (): void => {
  Object.defineProperty(window, 'visualViewport', {
    value: viewport,
    configurable: true
  })
}

export const removeViewport = (): void => {
  Object.defineProperty(window, 'visualViewport', {
    value: undefined,
    configurable: true
  })
}

/** The keyboard up (the viewport 300px short) or down. */
export const setKeyboard = (open: boolean): void => {
  viewport.height = open ? window.innerHeight - 300 : window.innerHeight
  act(() => {
    viewport.dispatchEvent(new Event('resize'))
  })
}
