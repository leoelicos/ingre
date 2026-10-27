/* Swipe gestures (#192): pure rules, so the thresholds are easy to test, and one hook. */
import type { PointerEvent } from 'react'
import { useRef, useState } from 'react'

export type Axis = 'x' | 'y'

/** A swipe: along an axis, in one direction (1: right or down, -1: left or up), far enough. */
export interface SwipeRule {
  readonly axis: Axis
  readonly sign: 1 | -1
  /** how far, in px, the pointer must travel before letting go counts as a swipe */
  readonly threshold: number
}

export interface Point {
  readonly x: number
  readonly y: number
}

/** A recipe card on mobile: swipe it up, across the row's sideways scroll (#192). */
export const CARD_SWIPE: SwipeRule = { axis: 'y', sign: -1, threshold: 96 }
/** A recipe row on desktop, in a column: swipe it left. */
export const ROW_SWIPE: SwipeRule = { axis: 'x', sign: -1, threshold: 120 }
/** The bottom sheet: swipe it down to close. */
export const SHEET_SWIPE: SwipeRule = { axis: 'y', sign: 1, threshold: 96 }

/** Below this a press that wobbles is still a press, not a drag. */
export const SLOP = 10

const delta = (from: Point, to: Point, axis: Axis): number =>
  axis === 'x' ? to.x - from.x : to.y - from.y

const other = (axis: Axis): Axis => (axis === 'x' ? 'y' : 'x')

/** How far the pointer went in the swipe's direction; negative when it went back. */
export const along = (from: Point, to: Point, rule: SwipeRule): number =>
  delta(from, to, rule.axis) * rule.sign

/** How far it went across the swipe's axis, either way. */
export const across = (from: Point, to: Point, rule: SwipeRule): number =>
  Math.abs(delta(from, to, other(rule.axis)))

/** Mostly along the axis (twice as far as across), so a scroll the other way never counts. */
export const onAxis = (from: Point, to: Point, rule: SwipeRule): boolean =>
  Math.abs(along(from, to, rule)) > 2 * across(from, to, rule)

/** Letting go here is a swipe: on the axis, the right way, past the threshold. */
export const isSwipe = (from: Point, to: Point, rule: SwipeRule): boolean =>
  onAxis(from, to, rule) && along(from, to, rule) >= rule.threshold

/** How far to draw the dragged element: only in the swipe's direction, never backwards. */
export const dragOffset = (from: Point, to: Point, rule: SwipeRule): number =>
  onAxis(from, to, rule) ? Math.max(0, along(from, to, rule)) : 0

/** True once the pointer has moved past the slop: a drag, not a press. */
export const hasMoved = (from: Point, to: Point): boolean =>
  Math.hypot(to.x - from.x, to.y - from.y) > SLOP

/** The CSS transform for an element dragged this far along the rule. */
export const dragTransform = (rule: SwipeRule, offset: number): string =>
  offset === 0
    ? ''
    : `translate${rule.axis.toUpperCase()}(${rule.sign * offset}px)`

/**
 * Keeps a dragging pointer's moves and lift on this element, wherever the pointer goes: React
 * Aria lets go of a touch on press, so without this the lift lands elsewhere. True if held;
 * false where the browser has no pointer capture.
 */
export const holdPointer = (el: Element, pointerId: number): boolean => {
  if (typeof el.setPointerCapture !== 'function') return false
  el.setPointerCapture(pointerId)
  return true
}

const pointOf = (e: PointerEvent): Point => ({ x: e.clientX, y: e.clientY })

/**
 * Pointer events (mouse, pen and touch) for a swipe. A drag past the slop is never also a
 * press: `wasDrag` stays true until the next press or key, so a tap handler can ignore the
 * click that follows a drag. While `enabled` is false nothing happens.
 */
export const useSwipe = (
  rule: SwipeRule,
  enabled: boolean,
  onSwipe: () => void
) => {
  const start = useRef<Point | null>(null)
  const dragged = useRef(false)
  const [offset, setOffset] = useState(0)
  const end = () => {
    start.current = null
    setOffset(0)
  }
  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      dragged.current = false
      if (enabled) start.current = pointOf(e)
    },
    onPointerMove: (e: PointerEvent) => {
      const from = start.current
      if (from === null) return
      const to = pointOf(e)
      if (!dragged.current && hasMoved(from, to)) {
        dragged.current = true
        holdPointer(e.currentTarget, e.pointerId)
      }
      setOffset(dragOffset(from, to, rule))
    },
    onPointerUp: (e: PointerEvent) => {
      const from = start.current
      end()
      if (from !== null && isSwipe(from, pointOf(e), rule)) onSwipe()
    },
    onPointerCancel: end,
    onKeyDownCapture: () => {
      dragged.current = false
    }
  }
  return {
    handlers,
    offset,
    transform: dragTransform(rule, offset),
    wasDrag: (): boolean => dragged.current
  }
}
