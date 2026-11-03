import { TextDecoder, TextEncoder } from 'util'

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder
}

// jsdom has no PointerEvent, so testing-library's pointer helpers become plain Events
// and clientX never arrives. A MouseEvent subclass keeps the coordinates (#192).
if (
  typeof window !== 'undefined' &&
  typeof window.PointerEvent !== 'function'
) {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number
    readonly width: number
    readonly height: number
    readonly pressure: number
    readonly tangentialPressure: number
    readonly tiltX: number
    readonly tiltY: number
    readonly twist: number
    readonly pointerType: string
    readonly isPrimary: boolean
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerId = init.pointerId ?? 0
      this.width = init.width ?? 1
      this.height = init.height ?? 1
      this.pressure = init.pressure ?? 0
      this.tangentialPressure = init.tangentialPressure ?? 0
      this.tiltX = init.tiltX ?? 0
      this.tiltY = init.tiltY ?? 0
      this.twist = init.twist ?? 0
      this.pointerType = init.pointerType ?? ''
      this.isPrimary = init.isPrimary ?? false
    }
  }
  window.PointerEvent =
    PointerEventPolyfill as unknown as typeof window.PointerEvent
}
