/*
 * Analytics events for the core loop (#222). Local logging only at first (owner's decision):
 * every event is appended to a capped log in localStorage and nothing leaves the device.
 * A remote sink can be added later behind `track` without touching its callers.
 */
import { readStored, writeStored } from '../storage/storage'

export const EVENT_NAMES = [
  'ingredient_searched',
  'suggestion_shown',
  'ticket_added',
  'mode_switched',
  'war_room_item_added'
] as const

export type EventName = (typeof EVENT_NAMES)[number]

/** What each event records. Plain values only, and nothing that identifies a person. */
export interface EventDetails {
  /** a settled Explore search, with how many ingredients and recipes it matched */
  ingredient_searched: {
    query: string
    ingredients: number
    recipes: number
  }
  /** a suggested recipe was put in front of the user */
  suggestion_shown: { recipeId: string }
  /** a recipe was added to the list */
  ticket_added: { recipeId: string }
  /** the guidance mode changed (self-directed to hand-held) */
  mode_switched: { from: string; to: string }
  /** an item was captured in the war room */
  war_room_item_added: { item: string }
}

type Value = string | number | boolean

export interface LoggedEvent {
  readonly name: EventName
  /** ISO 8601, UTC */
  readonly at: string
  readonly props: Readonly<Record<string, Value>>
}

export const EVENT_LOG_KEY = 'ingre.analytics.events'
/** The log keeps only the newest events, so it never fills the device's storage. */
export const MAX_EVENTS = 200

const isValue = (value: unknown): value is Value =>
  ['string', 'number', 'boolean'].includes(typeof value)

const isProps = (value: unknown): value is Record<string, Value> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(isValue)

const eventNameOf = (value: unknown): EventName | null =>
  EVENT_NAMES.find((name) => name === value) ?? null

const parseEvent = (value: unknown): LoggedEvent[] => {
  if (typeof value !== 'object' || value === null) return []
  const { name, at, props }: Record<string, unknown> = { ...value }
  const known = eventNameOf(name)
  return known !== null && typeof at === 'string' && isProps(props)
    ? [{ name: known, at, props }]
    : []
}

/** The stored log; entries that are not events are dropped. */
export const parseEvents = (value: unknown): LoggedEvent[] | null =>
  Array.isArray(value) ? value.flatMap(parseEvent) : null

/** The events logged on this device, oldest first. */
export const readEvents = (): LoggedEvent[] =>
  readStored(EVENT_LOG_KEY, parseEvents, [])

export const clearEvents = (): void => localStorage.removeItem(EVENT_LOG_KEY)

const store = (events: readonly LoggedEvent[]): void => {
  try {
    writeStored(EVENT_LOG_KEY, events.slice(-MAX_EVENTS))
  } catch {
    /* private mode or a full device: analytics must never break the app */
  }
}

/** Logs one named event on this device. Never throws and never makes a network request. */
export const track = <N extends EventName>(
  name: N,
  props: EventDetails[N]
): void =>
  store([...readEvents(), { name, at: new Date().toISOString(), props }])
