import { AISLES, SHOP_SECTIONS } from '../../../utils/shopping/sections'
import { TONE_CLASSES, categoryTone, sectionTone } from '../badgeTone'
import { BADGE_TONES, FALLBACK_TONE } from '../tones'

describe('badge tones', () => {
  it('colours produce green and each section by the data map', () => {
    expect(categoryTone('fruit & veg')).toBe('produce')
    expect(categoryTone('meat')).toBe('meat')
    expect(categoryTone('seafood')).toBe('meat')
    expect(categoryTone('dairy & eggs')).toBe('dairy')
    expect(categoryTone('deli')).toBe('deli')
    expect(categoryTone('bakery')).toBe('bakery')
    expect(categoryTone('herbs & spices')).toBe('pantry')
    expect(sectionTone('Frozen')).toBe('frozen')
    expect(sectionTone('Other')).toBe('neutral')
  })

  it('falls back to neutral for anything that is not a known aisle', () => {
    expect(FALLBACK_TONE).toBe('neutral')
    expect(categoryTone('other')).toBe(FALLBACK_TONE)
    expect(categoryTone('')).toBe(FALLBACK_TONE)
    expect(categoryTone('Fruit & Veg')).toBe(FALLBACK_TONE)
  })

  it('gives every section and aisle a known tone with full Tailwind classes', () => {
    SHOP_SECTIONS.forEach((s) => expect(BADGE_TONES).toContain(sectionTone(s)))
    AISLES.forEach((a) => expect(BADGE_TONES).toContain(categoryTone(a)))
    BADGE_TONES.forEach((tone) =>
      expect(TONE_CLASSES[tone]).toBe(
        `bg-badge-${tone} text-badge-${tone}-ink border-badge-${tone}-ink`
      )
    )
  })
})
