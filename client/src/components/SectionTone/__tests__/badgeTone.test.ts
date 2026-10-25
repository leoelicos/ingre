import { SHOP_SECTIONS } from '../../../utils/shopping/sections'
import { EDGE_TONE_CLASSES, TONE_CLASSES, sectionTone } from '../badgeTone'
import { BADGE_TONES } from '../tones'

describe('section tones', () => {
  it('colours each section by the data map, Other neutral', () => {
    expect(sectionTone('Fruit & Veg')).toBe('produce')
    expect(sectionTone('Meat & Seafood')).toBe('meat')
    expect(sectionTone('Frozen')).toBe('frozen')
    expect(sectionTone('Other')).toBe('neutral')
  })

  it('gives every section a known tone with full Tailwind classes', () => {
    SHOP_SECTIONS.forEach((s) => expect(BADGE_TONES).toContain(sectionTone(s)))
    BADGE_TONES.forEach((tone) =>
      expect(TONE_CLASSES[tone]).toBe(
        `bg-badge-${tone} text-badge-${tone}-ink border-badge-${tone}-ink`
      )
    )
  })

  it('gives every tone a chip edge: ink text and outline, and no fill', () => {
    BADGE_TONES.forEach((tone) =>
      expect(EDGE_TONE_CLASSES[tone]).toBe(
        `text-badge-${tone}-ink border-badge-${tone}-ink`
      )
    )
  })
})
