import { readFileSync } from 'fs'
import { join } from 'path'

const css = readFileSync(join(__dirname, '../index.css'), 'utf8')

/** The body of the reduced-motion media block (#223). */
const reducedMotionRule = (): string => {
  const start = css.indexOf('@media (prefers-reduced-motion: reduce)')
  return start === -1 ? '' : css.slice(start)
}

describe('reduced motion safety net (#223)', () => {
  it('has a prefers-reduced-motion block in index.css', () => {
    expect(reducedMotionRule()).not.toBe('')
  })

  it.each([
    'animation-duration: 0.01ms !important',
    'transition-duration: 0s !important',
    'transition-delay: 0s !important',
    'scroll-behavior: auto !important'
  ])('sets %s for every element', (declaration) => {
    expect(reducedMotionRule()).toContain(declaration)
  })

  it('covers pseudo-elements as well as elements', () => {
    const rule = reducedMotionRule()
    expect(rule).toContain('*::before')
    expect(rule).toContain('*::after')
  })
})
