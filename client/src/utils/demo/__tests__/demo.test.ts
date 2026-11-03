import {
  DEMO_INGREDIENTS,
  MAX_SUGGESTIONS,
  formatDollars,
  matchIngredients,
  suggest,
  toggleId,
  withTicket
} from '../demo'

describe('matchIngredients', () => {
  it('returns every ingredient for empty text', () => {
    expect(matchIngredients('  ')).toEqual(DEMO_INGREDIENTS)
  })
  it('matches part of a name', () => {
    expect(matchIngredients('carr').map((i) => i.id)).toEqual(['carrot'])
  })
  it('matches an alias but returns the primary ingredient', () => {
    expect(matchIngredients('caster')).toEqual([
      expect.objectContaining({ id: 'sugar', name: 'sugar' })
    ])
  })
  it('ignores case and finds nothing for an unknown word', () => {
    expect(matchIngredients('FLOUR')).toHaveLength(1)
    expect(matchIngredients('zzz')).toEqual([])
  })
})

describe('toggleId', () => {
  it('adds an id and removes it again', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b'])
  })
})

describe('suggest', () => {
  it('suggests nothing until something is picked', () => {
    expect(suggest([])).toEqual([])
  })
  it('says what carrot and flour still need and what that costs', () => {
    expect(suggest(['carrot', 'flour'])[0]).toEqual({
      id: 'carrot-cake',
      title: 'Carrot cake',
      missing: ['sugar'],
      costCents: 200
    })
  })
  it('puts a complete recipe first, with nothing missing', () => {
    const [first] = suggest(['carrot', 'flour', 'sugar'])
    expect(first).toEqual(
      expect.objectContaining({ id: 'carrot-cake', missing: [], costCents: 0 })
    )
  })
  it('orders by fewest missing, then by title, and caps the list', () => {
    const list = suggest(['flour', 'sugar', 'rice', 'onion'])
    expect(list.length).toBeLessThanOrEqual(MAX_SUGGESTIONS)
    expect(list.map((s) => s.missing.length)).toEqual(
      [...list.map((s) => s.missing.length)].sort((a, b) => a - b)
    )
    const tied = suggest(['rice', 'onion']).map((s) => s.title)
    expect(tied).toEqual(['Chicken and rice', 'Egg fried rice'])
  })
})

describe('withTicket', () => {
  const cake = { id: 'carrot-cake', title: 'Carrot cake' }
  it('adds a ticket once', () => {
    const once = withTicket([], cake)
    expect(once).toEqual([cake])
    expect(withTicket(once, cake)).toBe(once)
  })
})

describe('formatDollars', () => {
  it('drops the cents when there are none', () => {
    expect(formatDollars(200)).toBe('$2')
    expect(formatDollars(0)).toBe('$0')
  })
  it('keeps two places when there are cents', () => {
    expect(formatDollars(450)).toBe('$4.50')
  })
})
