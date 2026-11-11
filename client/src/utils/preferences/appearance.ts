/*
 * Appearance preferences, kept on the device: the colour theme and the text size. Applied to
 * <html> (data-theme and font-size), so every page and every rem-based size follows them.
 */
import { readStored, writeStored } from '../storage/storage'

export type Theme = 'system' | 'light' | 'dark'
export const THEMES: readonly Theme[] = ['system', 'light', 'dark']

/** Text size as a percentage of the standard 16px: 100 to 200 (WCAG 1.4.4 asks for 200%). */
export const MIN_TEXT_SIZE = 100
export const MAX_TEXT_SIZE = 200
export const STANDARD_TEXT_SIZE = 100
/** The root font size the whole layout is built on (index.css). */
export const BASE_FONT_PX = 16

export interface Appearance {
  readonly theme: Theme
  /** a whole number from MIN_TEXT_SIZE to MAX_TEXT_SIZE */
  readonly textSize: number
}

export const APPEARANCE_KEY = 'ingre.preferences.appearance'

export const STANDARD_APPEARANCE: Appearance = {
  theme: 'system',
  textSize: STANDARD_TEXT_SIZE
}

export const isTextSize = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= MIN_TEXT_SIZE &&
  value <= MAX_TEXT_SIZE

/** Stored appearance; anything unreadable falls back to the standard value, field by field. */
export const parseAppearance = (value: unknown): Appearance | null => {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return null
  const record: Record<string, unknown> = { ...value }
  return {
    theme: THEMES.find((theme) => theme === record['theme']) ?? 'system',
    textSize: isTextSize(record['textSize'])
      ? record['textSize']
      : STANDARD_TEXT_SIZE
  }
}

export const readAppearance = (): Appearance =>
  readStored(APPEARANCE_KEY, parseAppearance, STANDARD_APPEARANCE)

export const writeAppearance = (appearance: Appearance): void =>
  writeStored(APPEARANCE_KEY, appearance)

/**
 * Puts an appearance on the page. "Match my device" removes the attribute, so the
 * prefers-color-scheme media query decides; the standard size removes the inline font size,
 * so index.css decides.
 */
export const applyAppearance = (
  { theme, textSize }: Appearance,
  root: HTMLElement = document.documentElement
): void => {
  if (theme === 'system') delete root.dataset['theme']
  else root.dataset['theme'] = theme
  root.style.fontSize =
    textSize === STANDARD_TEXT_SIZE
      ? ''
      : `${(BASE_FONT_PX * textSize) / 100}px`
}
