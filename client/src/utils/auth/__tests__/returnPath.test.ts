import { returnPath } from '../returnPath'

describe('returnPath', () => {
  it('reads a string starting page', () => {
    expect(returnPath({ from: '/saved' })).toBe('/saved')
  })

  it('falls back to home when the starting page is missing', () => {
    expect(returnPath(null)).toBe('/')
    expect(returnPath(undefined)).toBe('/')
    expect(returnPath('login')).toBe('/')
    expect(returnPath({})).toBe('/')
    expect(returnPath({ from: 1 })).toBe('/')
    expect(returnPath({ from: '' })).toBe('/')
  })
})
