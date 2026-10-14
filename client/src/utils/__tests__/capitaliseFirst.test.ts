import { capitaliseFirst } from '../capitaliseFirst'

describe('capitaliseFirst', () => {
  it('upper-cases only the first character', () => {
    expect(capitaliseFirst('banana')).toBe('Banana')
    expect(capitaliseFirst('pork loin chops')).toBe('Pork loin chops')
    expect(capitaliseFirst('Shaking beef')).toBe('Shaking beef')
    expect(capitaliseFirst('')).toBe('')
  })
})
