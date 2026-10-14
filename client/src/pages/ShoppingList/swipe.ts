import type { FlowStep } from '../../utils/storage/shoppingState'
import { FLOW_STEPS } from '../../utils/storage/shoppingState'

/** Fraction of the screen a swipe must travel before the step changes. */
export const SWIPE_THRESHOLD = 0.4

/** Step index after a horizontal drag of `dx` px (positive = finger moved right). */
export const swipeTarget = (
  index: number,
  dx: number,
  width: number,
  count: number
): number => {
  if (width <= 0 || Math.abs(dx) <= width * SWIPE_THRESHOLD) return index
  const next = dx < 0 ? index + 1 : index - 1
  return Math.min(count - 1, Math.max(0, next))
}

/** Rubber-band the drag at the first and last step. */
export const dragOffset = (index: number, dx: number, count: number): number =>
  (index === 0 && dx > 0) || (index === count - 1 && dx < 0) ? dx / 3 : dx

/** Step at index `i`, or `fallback` when out of range. */
export const stepAt = (i: number, fallback: FlowStep): FlowStep =>
  FLOW_STEPS[i] ?? fallback
