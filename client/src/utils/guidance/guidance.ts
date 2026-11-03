/*
 * The Explore dial (#206): four modes from Self-directed to Hand-held.
 *
 *   Self-directed  no suggestions, no tips
 *   Guided         no suggestions, tooltips
 *   Assisted       suggestions + tooltips + one or two outlines   (the default)
 *   Hand-held      suggestions + tooltips + constant outlines and faster actions
 */

export const GUIDANCE_MODES = [
  'self-directed',
  'guided',
  'assisted',
  'hand-held'
] as const

export type Guidance = (typeof GUIDANCE_MODES)[number]

/** Used when the user skips choosing. */
export const DEFAULT_GUIDANCE: Guidance = 'assisted'

/** A dial position (0 to 3) for a mode. */
export const guidanceIndex = (mode: Guidance): number =>
  GUIDANCE_MODES.indexOf(mode)

/** The mode at a dial position; Assisted for a position off the dial. */
export const guidanceAt = (index: number): Guidance =>
  GUIDANCE_MODES.find((_, i) => i === index) ?? DEFAULT_GUIDANCE

/** A stored value as a mode, or null when it is not one. */
export const parseGuidance = (value: unknown): Guidance | null =>
  GUIDANCE_MODES.find((mode) => mode === value) ?? null

/** Suggestions are proactive from Assisted up; below that they are only on request (Details). */
export const showsSuggestions = (mode: Guidance): boolean =>
  guidanceIndex(mode) >= guidanceIndex('assisted')

/** Tooltips from Guided up. */
export const showsTips = (mode: Guidance): boolean =>
  guidanceIndex(mode) >= guidanceIndex('guided')

/** How many missing ingredients a mode outlines: none, none, one or two, all. */
export const outlineLimit = (mode: Guidance): number =>
  mode === 'hand-held' ? Number.POSITIVE_INFINITY : mode === 'assisted' ? 2 : 0

/** The ids of the missing ingredients to outline in this mode. */
export const flaggedIds = (
  missing: readonly { readonly id: string }[],
  mode: Guidance
): ReadonlySet<string> =>
  new Set(missing.slice(0, outlineLimit(mode)).map((item) => item.id))
