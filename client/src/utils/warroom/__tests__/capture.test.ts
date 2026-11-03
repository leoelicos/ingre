import { autofill, captureOf, splitQuantity } from '../capture'

/* Acceptance for #207: instant substring autofill on short and long names, quantity optional, generic names enough. */

const ids = (query: string) => autofill(query).map((item) => item.id)

describe('autofill: every keystroke finds ingredients', () => {
  it('finds by any part of the name', () => {
    expect(ids('car')).toContain('carrot')
    expect(ids('rrot')).toContain('carrot')
  })

  it('finds a long name by its short name and the other way round', () => {
    expect(ids('cream')).toContain('cream')
    expect(ids('thickened cream')).toContain('cream')
  })

  it('finds plurals and every word in any order', () => {
    expect(ids('carrots')).toContain('carrot')
    expect(ids('mince beef')).toContain('beef-mince')
  })

  it('ranks names that start with the text first, and shows at most six', () => {
    const found = autofill('b')
    expect(found).toHaveLength(6)
    expect(found[0]?.name.startsWith('b')).toBe(true)
  })

  it('shows nothing for blank text or text that matches nothing', () => {
    expect(ids('')).toEqual([])
    expect(ids('   ')).toEqual([])
    expect(ids('zzzz')).toEqual([])
  })
})

describe('splitQuantity: a leading number is the quantity, and it is optional', () => {
  it('reads "3 carrots", "3x carrots" and "12 eggs"', () => {
    expect(splitQuantity('3 carrots')).toEqual({ quantity: 3, term: 'carrots' })
    expect(splitQuantity('3x carrots')).toEqual({
      quantity: 3,
      term: 'carrots'
    })
    expect(splitQuantity('12 eggs')).toEqual({ quantity: 12, term: 'eggs' })
  })

  it('does not mistake a word that starts with x for the multiplier', () => {
    expect(splitQuantity('2 xanthan gum')).toEqual({
      quantity: 2,
      term: 'xanthan gum'
    })
  })

  it('is one when there is no number or it is zero', () => {
    expect(splitQuantity('carrots')).toEqual({ quantity: 1, term: 'carrots' })
    expect(splitQuantity('0 carrots')).toEqual({ quantity: 1, term: 'carrots' })
  })
})

describe('captureOf: one line or a whole spoken sentence', () => {
  it('splits on commas, "and", semicolons and new lines', () => {
    const found = captureOf('2 carrots, onion and garlic; eggs\nbutter')
    expect(found.map((c) => c.term)).toEqual([
      'carrots',
      'onion',
      'garlic',
      'eggs',
      'butter'
    ])
    expect(found[0]?.quantity).toBe(2)
    expect(found[1]?.quantity).toBe(1)
  })

  it('matches each to its best ingredient, or null when none fits', () => {
    const [carrot, nothing] = captureOf('carrots, zzzz')
    expect(carrot?.item?.id).toBe('carrot')
    expect(nothing?.item).toBeNull()
  })

  it('is empty for blank text', () => {
    expect(captureOf('')).toEqual([])
    expect(captureOf(' , and ')).toEqual([])
  })
})
