import { readFileSync } from 'fs'
import { join } from 'path'
import { BADGE_TONES } from '../tones'

const theme = readFileSync(join(__dirname, '../../../styles/theme.css'), 'utf8')
const tailwind = readFileSync(
  join(__dirname, '../../../../tailwind.config.js'),
  'utf8'
)

const token = (name: string): string =>
  theme.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`, 'i'))?.[1] ?? ''

const channel = (hex: string, at: number): number => {
  const c = parseInt(hex.slice(at, at + 2), 16) / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = (hex: string): number =>
  0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)

/** WCAG 2.x contrast ratio between two #rrggbb colours. */
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05)
}

describe('badge colours', () => {
  it('measures contrast like WCAG', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21)
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1)
  })

  it.each(BADGE_TONES)('%s ink on its background is at least 4.5:1', (tone) => {
    const bg = token(`color-badge-${tone}`)
    const ink = token(`color-badge-${tone}-ink`)
    expect(bg).toMatch(/^#/)
    expect(ink).toMatch(/^#/)
    expect(contrast(ink, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(BADGE_TONES)(
    '%s is a Tailwind colour backed by its theme token',
    (tone) => {
      expect(tailwind).toContain(
        `'badge-${tone}': 'var(--color-badge-${tone})'`
      )
      expect(tailwind).toContain(
        `'badge-${tone}-ink': 'var(--color-badge-${tone}-ink)'`
      )
    }
  )
})
