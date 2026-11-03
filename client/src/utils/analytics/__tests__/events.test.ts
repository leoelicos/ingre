import {
  EVENT_LOG_KEY,
  EVENT_NAMES,
  MAX_EVENTS,
  clearEvents,
  parseEvents,
  readEvents,
  track
} from '../events'

/* #222: named core-loop events, logged on this device only. */

beforeEach(() => localStorage.clear())
afterEach(() => jest.restoreAllMocks())

describe('event names (#222)', () => {
  it('are the five core-loop events, exactly', () => {
    expect(EVENT_NAMES).toEqual([
      'ingredient_searched',
      'suggestion_shown',
      'ticket_added',
      'mode_switched',
      'war_room_item_added'
    ])
  })
})

describe('track (#222)', () => {
  it('logs each of the five events with its name, a time and its details', () => {
    track('ingredient_searched', { query: 'dahl', ingredients: 1, recipes: 2 })
    track('suggestion_shown', { recipeId: 'dahl' })
    track('ticket_added', { recipeId: 'dahl' })
    track('mode_switched', { from: 'assisted', to: 'hand-held' })
    track('war_room_item_added', { item: 'carrot' })
    const events = readEvents()
    expect(events.map((event) => event.name)).toEqual([...EVENT_NAMES])
    expect(events[0]).toEqual({
      name: 'ingredient_searched',
      at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      props: { query: 'dahl', ingredients: 1, recipes: 2 }
    })
    expect(events[4]?.props).toEqual({ item: 'carrot' })
  })

  it('keeps events across reads and clears them on request', () => {
    track('ticket_added', { recipeId: 'dahl' })
    expect(readEvents()).toHaveLength(1)
    expect(readEvents()).toHaveLength(1)
    clearEvents()
    expect(readEvents()).toEqual([])
  })

  it('keeps only the newest events', () => {
    for (let i = 0; i < MAX_EVENTS + 5; i += 1)
      track('war_room_item_added', { item: `item ${i}` })
    const events = readEvents()
    expect(events).toHaveLength(MAX_EVENTS)
    expect(events[0]?.props).toEqual({ item: 'item 5' })
    expect(events.at(-1)?.props).toEqual({ item: `item ${MAX_EVENTS + 4}` })
  })

  it('never throws when the device will not store it', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full')
    })
    expect(() => track('ticket_added', { recipeId: 'dahl' })).not.toThrow()
  })

  it('makes no network request', () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch')
    const beacon = jest.fn()
    Object.defineProperty(navigator, 'sendBeacon', {
      value: beacon,
      configurable: true
    })
    track('ticket_added', { recipeId: 'dahl' })
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(beacon).not.toHaveBeenCalled()
  })
})

describe('reading the log (#222)', () => {
  it('starts empty', () => {
    expect(readEvents()).toEqual([])
  })

  it('drops entries that are not events', () => {
    const good = {
      name: 'ticket_added',
      at: '2026-11-03T00:00:00.000Z',
      props: { recipeId: 'dahl' }
    }
    localStorage.setItem(
      EVENT_LOG_KEY,
      JSON.stringify([
        good,
        { name: 'page_viewed', at: 'x', props: {} },
        { name: 'ticket_added', at: 5, props: {} },
        { name: 'ticket_added', at: 'x', props: [] },
        { name: 'ticket_added', at: 'x', props: { a: {} } },
        { name: 'ticket_added', at: 'x', props: null },
        null,
        'text'
      ])
    )
    expect(readEvents()).toEqual([good])
  })

  it('ignores a log that is not a list or not JSON', () => {
    localStorage.setItem(EVENT_LOG_KEY, '{}')
    expect(readEvents()).toEqual([])
    localStorage.setItem(EVENT_LOG_KEY, 'oops')
    expect(readEvents()).toEqual([])
    expect(parseEvents('nope')).toBeNull()
  })
})
