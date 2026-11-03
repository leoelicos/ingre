/* A swipe to the right with a finger or pen (#229). Never the mouse: dragging with a mouse selects text. */
import type { PointerEvent } from 'react'
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

/** Pointer handlers for an element: calls `onSwipe` when a finger or pen swipes right across it. */
export const useSwipeRight = (onSwipe: () => void) => {
  const start = useRef<Point | null>(null)
  return {
    onPointerDown: (event: PointerEvent) => {
      start.current = fromFinger(event) ? pointOf(event) : null
    },
    onPointerUp: (event: PointerEvent) => {
      const from = start.current
      start.current = null
      if (from !== null && isSwipeRight(from, pointOf(event))) onSwipe()
    },
    onPointerCancel: () => {
      start.current = null
    }
  }
}
