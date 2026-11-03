import {
  DEFAULT_GUIDANCE,
  GUIDANCE_MODES,
  flaggedIds,
  guidanceAt,
  guidanceIndex,
  outlineLimit,
  parseGuidance,
  showsSuggestions,
  showsTips
} from '../guidance'

/* Acceptance for #206: four Explore modes on a dial; Assisted unless the user chose otherwise. */

describe('the four Explore modes (#206)', () => {
  it('run from Self-directed to Hand-held', () => {
    expect(GUIDANCE_MODES).toEqual([
      'self-directed',
      'guided',
      'assisted',
      'hand-held'
    ])
  })

  it('default to Assisted (when the user skips choosing)', () => {
    expect(DEFAULT_GUIDANCE).toBe('assisted')
  })

  it('map to dial positions and back', () => {
    GUIDANCE_MODES.forEach((mode, index) => {
      expect(guidanceIndex(mode)).toBe(index)
      expect(guidanceAt(index)).toBe(mode)
    })
  })

  it('fall back to Assisted for a position off the dial', () => {
    expect(guidanceAt(-1)).toBe('assisted')
    expect(guidanceAt(4)).toBe('assisted')
  })

  it('parse a stored mode, and nothing else', () => {
    expect(parseGuidance('hand-held')).toBe('hand-held')
    expect(parseGuidance('assisted')).toBe('assisted')
    expect(parseGuidance('hands-off')).toBeNull()
    expect(parseGuidance(2)).toBeNull()
    expect(parseGuidance(null)).toBeNull()
  })
})

describe('what each mode does (#206 table)', () => {
  it('shows suggestions only in Assisted and Hand-held', () => {
    expect(GUIDANCE_MODES.map(showsSuggestions)).toEqual([
      false,
      false,
      true,
      true
    ])
  })

  it('shows tooltips from Guided up', () => {
    expect(GUIDANCE_MODES.map(showsTips)).toEqual([false, true, true, true])
  })

  it('outlines none, none, one or two, then all', () => {
    expect(GUIDANCE_MODES.map(outlineLimit)).toEqual([
      0,
      0,
      2,
      Number.POSITIVE_INFINITY
    ])
  })

  it('flags the missing ingredients up to the mode limit', () => {
    const missing = ['a', 'b', 'c', 'd'].map((id) => ({ id }))
    expect([...flaggedIds(missing, 'self-directed')]).toEqual([])
    expect([...flaggedIds(missing, 'guided')]).toEqual([])
    expect([...flaggedIds(missing, 'assisted')]).toEqual(['a', 'b'])
    expect([...flaggedIds(missing, 'hand-held')]).toEqual(['a', 'b', 'c', 'd'])
    expect([...flaggedIds([{ id: 'a' }], 'assisted')]).toEqual(['a'])
  })
})
