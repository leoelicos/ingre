import { readFileSync } from 'fs'
import { join } from 'path'
import { BADGE_TONES } from '../tones'

const theme = readFileSync(join(__dirname, '../../../styles/theme.css'), 'utf8')
const tailwind = readFileSync(
  join(__dirname, '../../../../tailwind.config.js'),
  'utf8'
)

const DARK_MARKER = '@media (prefers-color-scheme: dark)'

/** The light tokens (before the dark block) and the dark overrides (inside it). */
const [lightBlock = '', darkBlock = ''] = theme.split(DARK_MARKER)

type Theme = 'light' | 'dark'

const BLOCKS: Readonly<Record<Theme, readonly string[]>> = {
  light: [lightBlock],
  /* a dark value wins; anything the dark block leaves alone keeps its light value */
  dark: [darkBlock, lightBlock]
}

const declared = (block: string, name: string): string =>
  block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.replace(/\s+/g, '') ??
  ''

/** First declaration of a token in the theme's blocks, in priority order. */
const raw = (mode: Theme, name: string): string =>
  BLOCKS[mode].map((block) => declared(block, name)).find((v) => v !== '') ?? ''

/** A token's #rrggbb value in a theme, following var(--other) references. */
const resolve = (mode: Theme, name: string): string => {
  const value = raw(mode, name)
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/)?.[1]
  return ref === undefined ? value : resolve(mode, ref)
}

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

const HEX = /^#[0-9a-f]{6}$/i
const THEMES: readonly Theme[] = ['light', 'dark']

/** Text tokens and the surfaces they sit on: at least 4.5:1. */
const TEXT_PAIRS: readonly (readonly [string, string])[] = [
  ['color-text', 'color-bg'],
  ['color-text', 'color-surface'],
  ['color-text', 'color-chip-active'],
  ['color-text-secondary', 'color-bg'],
  ['color-text-secondary', 'color-surface'],
  ['color-placeholder', 'color-bg'],
  ['color-placeholder', 'color-surface'],
  ['color-primary', 'color-bg'],
  ['color-primary', 'color-surface'],
  ['color-added-pill', 'color-chip-active'],
  ['color-on-primary', 'color-primary'],
  ['color-added-pill', 'color-surface'],
  ['color-allergen', 'color-surface'],
  ['color-inverse-text', 'color-text']
]

/** Icons, outlines and the focus ring: at least 3:1. */
const UI_PAIRS: readonly (readonly [string, string])[] = [
  ['color-border', 'color-bg'],
  ['color-border', 'color-surface'],
  ['color-primary', 'color-bg'],
  ['color-accent', 'color-bg'],
  ['color-accent', 'color-surface'],
  ['color-brand', 'color-bg']
]

/** Section raised, rows recessed, chips raised (and pressed once crossed off). */
const SHADOWS: readonly string[] = [
  'section',
  'recessed',
  'chip',
  'chip-pressed'
]

const cases = (pairs: readonly (readonly [string, string])[]) =>
  THEMES.flatMap((mode) =>
    pairs.map(([fg, bg]): [Theme, string, string] => [mode, fg, bg])
  )

describe('badge colours', () => {
  it('measures contrast like WCAG', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21)
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1)
  })

  it('has a dark block that follows the system setting', () => {
    expect(theme).toContain(DARK_MARKER)
    expect(darkBlock).not.toBe('')
    expect(tailwind).toContain("darkMode: 'media'")
  })

  it('resolves var() references and falls back to the light value', () => {
    expect(resolve('light', 'color-primary')).toBe('#2f7d4f')
    expect(resolve('dark', 'color-primary')).toBe('#74c995')
    expect(resolve('dark', 'color-print-ink')).toBe('#000000')
    expect(resolve('dark', 'no-such-token')).toBe('')
  })

  it.each(THEMES)(
    '%s: every badge tone is overridden for the theme',
    (mode) => {
      BADGE_TONES.forEach((tone) => {
        expect(declared(BLOCKS[mode][0] ?? '', `color-badge-${tone}`)).toMatch(
          HEX
        )
        expect(
          declared(BLOCKS[mode][0] ?? '', `color-badge-${tone}-ink`)
        ).toMatch(HEX)
      })
    }
  )

  it.each(
    THEMES.flatMap((mode) =>
      BADGE_TONES.map((tone): [Theme, string] => [mode, tone])
    )
  )('%s: %s ink on its background is at least 4.5:1', (mode, tone) => {
    const bg = resolve(mode, `color-badge-${tone}`)
    const ink = resolve(mode, `color-badge-${tone}-ink`)
    expect(bg).toMatch(HEX)
    expect(ink).toMatch(HEX)
    expect(contrast(ink, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(
    THEMES.flatMap((mode) =>
      BADGE_TONES.map((tone): [Theme, string] => [mode, tone])
    )
  )(
    '%s: %s badge ring reads at least 3:1 on the card surface',
    (mode, tone) => {
      const ring = resolve(mode, `color-badge-${tone}-ink`)
      expect(
        contrast(ring, resolve(mode, 'color-surface'))
      ).toBeGreaterThanOrEqual(3)
    }
  )

  it.each(
    THEMES.flatMap((mode) =>
      BADGE_TONES.map((tone): [Theme, string] => [mode, tone])
    )
  )(
    '%s: %s chip (no fill) ink text and edge read at least 4.5:1 on the page',
    (mode, tone) => {
      const ink = resolve(mode, `color-badge-${tone}-ink`)
      expect(contrast(ink, resolve(mode, 'color-bg'))).toBeGreaterThanOrEqual(
        4.5
      )
    }
  )

  it.each(THEMES)(
    '%s: the neumorphic shadows are tokens backed by Tailwind',
    (mode) => {
      SHADOWS.forEach((name) => {
        expect(declared(BLOCKS[mode][0] ?? '', `shadow-${name}`)).not.toBe('')
        expect(tailwind).toContain(`'var(--shadow-${name})'`)
      })
    }
  )

  it.each(cases(TEXT_PAIRS))(
    '%s: %s text on %s is at least 4.5:1',
    (mode, fg, bg) => {
      expect(resolve(mode, fg)).toMatch(HEX)
      expect(resolve(mode, bg)).toMatch(HEX)
      expect(
        contrast(resolve(mode, fg), resolve(mode, bg))
      ).toBeGreaterThanOrEqual(4.5)
    }
  )

  it.each(cases(UI_PAIRS))(
    '%s: %s outline or icon on %s is at least 3:1',
    (mode, fg, bg) => {
      expect(
        contrast(resolve(mode, fg), resolve(mode, bg))
      ).toBeGreaterThanOrEqual(3)
    }
  )

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

  it('uses no raw colour codes in the dark block outside token declarations', () => {
    const outsideTokens = darkBlock
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
    expect(outsideTokens).not.toMatch(/#[0-9a-f]{3,6}\b/i)
  })
})
