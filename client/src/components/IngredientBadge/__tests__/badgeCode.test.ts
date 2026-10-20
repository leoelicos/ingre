import { catalogue } from '../../../utils/library/recipeLibrary'
import { EMPTY_CODE, badgeCode, codeWords } from '../badgeCode'

describe('badgeCode', () => {
  it('uses the first three letters of a one-word name', () => {
    expect(badgeCode('Tomato')).toBe('TOM')
    expect(badgeCode('tomatoes')).toBe('TOM')
    expect(badgeCode('egg')).toBe('EGG')
  })

  it('keeps short names short', () => {
    expect(badgeCode('ox')).toBe('OX')
  })

  it('uses an initialism for several words so similar items differ', () => {
    expect(badgeCode('beef mince')).toBe('BMI')
    expect(badgeCode('beef rump steak')).toBe('BST')
    expect(badgeCode('beef sausages')).toBe('BSA')
    expect(badgeCode('tomato paste')).toBe('TPA')
  })

  it('ignores accents, punctuation and spacing', () => {
    expect(codeWords('  Crème-fraîche ')).toEqual(['CREME', 'FRAICHE'])
    expect(badgeCode('Crème fraîche')).toBe('CFR')
    expect(badgeCode('jalapeño')).toBe('JAL')
  })

  it('never returns an empty code', () => {
    expect(badgeCode('')).toBe(EMPTY_CODE)
    expect(badgeCode(' - ')).toBe(EMPTY_CODE)
  })

  it('gives every catalogue item a 1-3 character upper-case code', () => {
    catalogue.forEach(({ name }) =>
      expect(badgeCode(name)).toMatch(/^[A-Z0-9]{1,3}$/)
    )
  })
})
