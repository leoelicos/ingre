import {
  APPEARANCE_KEY,
  STANDARD_APPEARANCE,
  applyAppearance,
  isTextSize,
  parseAppearance,
  readAppearance,
  writeAppearance
} from '../appearance'

describe('appearance preferences', () => {
  beforeEach(() => localStorage.clear())

  it('reads the standard appearance when nothing is stored', () => {
    expect(readAppearance()).toEqual(STANDARD_APPEARANCE)
    expect(STANDARD_APPEARANCE).toEqual({ theme: 'system', textSize: 100 })
  })

  it('round-trips what was written', () => {
    writeAppearance({ theme: 'dark', textSize: 150 })
    expect(localStorage.getItem(APPEARANCE_KEY)).toBe(
      '{"theme":"dark","textSize":150}'
    )
    expect(readAppearance()).toEqual({ theme: 'dark', textSize: 150 })
  })

  it('drops anything unreadable, field by field', () => {
    expect(parseAppearance(null)).toBeNull()
    expect(parseAppearance('dark')).toBeNull()
    expect(parseAppearance(['dark'])).toBeNull()
    expect(parseAppearance({ theme: 'purple', textSize: 999 })).toEqual(
      STANDARD_APPEARANCE
    )
    expect(parseAppearance({ theme: 'light', textSize: 125 })).toEqual({
      theme: 'light',
      textSize: 125
    })
  })

  it('accepts whole text sizes from 100 to 200 only', () => {
    expect([100, 200, 125].every(isTextSize)).toBe(true)
    expect([99, 201, 12.5, '125', null].some(isTextSize)).toBe(false)
  })

  it('puts the theme and text size on <html>, and takes them off again', () => {
    const root = document.documentElement
    applyAppearance({ theme: 'dark', textSize: 125 })
    expect(root.dataset['theme']).toBe('dark')
    expect(root.style.fontSize).toBe('20px')
    applyAppearance({ theme: 'light', textSize: 200 }, root)
    expect(root.getAttribute('data-theme')).toBe('light')
    expect(root.style.fontSize).toBe('32px')
    applyAppearance(STANDARD_APPEARANCE)
    expect(root.hasAttribute('data-theme')).toBe(false)
    expect(root.style.fontSize).toBe('')
  })
})
