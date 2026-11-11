import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * The theme picked in Preferences (data-theme on <html>) beats the device setting. The forced
 * dark block repeats the device-dark values, so this keeps the two from drifting apart.
 */
const theme = readFileSync(join(__dirname, '../styles/theme.css'), 'utf8')

/** The declarations inside the first `{ ... }` after a selector, without spaces or comments. */
const block = (selector: string): string[] => {
  const start = theme.indexOf(selector)
  const open = theme.indexOf('{', start)
  const close = theme.indexOf('}', open)
  return theme
    .slice(open + 1, close)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(';')
    .map((line) => line.replace(/\s+/g, ''))
    .filter((line) => line !== '')
}

describe('theme override', () => {
  const deviceDark = block(":root:not([data-theme='light'])")
  const pickedDark = block(":root[data-theme='dark']")

  it('lets a Light pick switch off the device dark mode', () => {
    expect(theme).toMatch(
      /@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme='light'\]\) \{/
    )
  })

  it('gives a Dark pick exactly the device dark values', () => {
    expect(deviceDark.length).toBeGreaterThan(40)
    expect(pickedDark).toEqual(deviceDark)
    expect(pickedDark).toContain('color-scheme:dark')
  })
})
