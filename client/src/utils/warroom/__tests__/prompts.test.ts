import en from '../../../i18n/locales/en.json'
import { captureOf } from '../capture'
import { nextPrompt, PROMPTS } from '../prompts'

/* t26u: every example the War room shows is something the parser really understands. */

const text = (key: string): string =>
  (en.warRoomEntry.prompts as Record<string, string>)[key] ?? ''

describe('War room examples', () => {
  it.each(PROMPTS.map(({ key, kind }) => [key, kind]))(
    '%s (%s) is in the locale and every part of it finds an ingredient',
    (key) => {
      const found = captureOf(text(key))
      expect(found.length).toBeGreaterThan(0)
      expect(found.filter(({ item }) => item === null)).toEqual([])
    }
  )

  it('shows the quantities the examples promise', () => {
    const quantity = (key: string) => captureOf(text(key))[0]?.quantity
    expect(quantity('carrots')).toBe(3)
    expect(quantity('chickpeas')).toBe(2)
    expect(quantity('flour')).toBe(1)
    expect(quantity('lemons')).toBe(4)
    expect(quantity('eggs')).toBe(12)
    expect(captureOf(text('stirFry'))).toHaveLength(3)
  })

  it('covers every kind, has one locale entry per example, and goes round', () => {
    expect(new Set(PROMPTS.map(({ kind }) => kind)).size).toBe(8)
    expect(Object.keys(en.warRoomEntry.prompts).sort()).toEqual(
      PROMPTS.map(({ key }) => key).sort()
    )
    expect(nextPrompt(0)).toBe(1)
    expect(nextPrompt(PROMPTS.length - 1)).toBe(0)
  })
})
