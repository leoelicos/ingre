/** jsdom has no PointerEvent: a MouseEvent that also carries pointerType, so fireEvent.pointerDown can set it. */
class TestPointerEvent extends MouseEvent {
  readonly pointerType: string
  constructor(type: string, init: MouseEventInit & { pointerType: string }) {
    super(type, init)
    this.pointerType = init.pointerType
  }
}

export const installPointerEvent = (): void => {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: TestPointerEvent
  })
}
