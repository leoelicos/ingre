/* A swipe to the right with a finger or pen (#229). Never the mouse: dragging with a mouse selects text. */
import type { MouseEvent, PointerEvent } from 'react'
import { useRef } from 'react'

/** How far right a swipe must go, in CSS pixels. */
export const SWIPE_MIN = 64

interface Point {
  x: number
  y: number
}

/** Mostly sideways: at least SWIPE_MIN right, and at least twice as far across as up or down. */
export const isSwipeRight = (from: Point, to: Point): boolean => {
  const dx = to.x - from.x
  return dx >= SWIPE_MIN && dx >= 2 * Math.abs(to.y - from.y)
}

const fromFinger = (event: PointerEvent): boolean =>
  event.pointerType === 'touch' || event.pointerType === 'pen'

const pointOf = (event: PointerEvent): Point => ({
  x: event.clientX,
  y: event.clientY
})

/**
 * Handlers for an element: calls `onSwipe` when a finger or pen swipes right across it.
 * They are capture handlers, because a button inside the element stops pointer events bubbling.
 * A swipe that starts and ends on a button is also a press of that button, and some browsers
 * send a click after it, so neither is a tap: `wasSwipe` says the press is the swipe's own (it
 * lands in the same tick), and the click that comes later is swallowed. Any new touch or key press starts fresh (the keyboard's click has no detail).
 */
export const useSwipeRight = (onSwipe: () => void) => {
  const start = useRef<Point | null>(null)
  const swiped = useRef(false)
  const justSwiped = useRef(false)
  const forget = () => {
    swiped.current = false
  }
  const markSwiped = () => {
    swiped.current = true
    justSwiped.current = true
    setTimeout(() => {
      justSwiped.current = false
    }, 0)
  }
  return {
    handlers: {
      onPointerDownCapture: (event: PointerEvent) => {
        forget()
        start.current = fromFinger(event) ? pointOf(event) : null
      },
      onPointerUpCapture: (event: PointerEvent) => {
        const from = start.current
        start.current = null
        if (from === null || !isSwipeRight(from, pointOf(event))) return
        markSwiped()
        onSwipe()
      },
      onPointerCancelCapture: () => {
        start.current = null
      },
      onKeyDownCapture: forget,
      onClickCapture: (event: MouseEvent) => {
        if (swiped.current && event.detail > 0) event.stopPropagation()
      }
    },
    wasSwipe: (): boolean => justSwiped.current
  }
}
