import { errorList, formErrors, readTextSize, textSizeError } from '../validate'

describe('Preferences validation', () => {
  it('reads a whole number, forgiving spaces and a trailing %', () => {
    expect(readTextSize('125')).toBe(125)
    expect(readTextSize(' 125 % ')).toBe(125)
    expect(readTextSize('125%')).toBe(125)
    expect(readTextSize('12.5')).toBeNull()
    expect(readTextSize('big')).toBeNull()
    expect(readTextSize('-110')).toBeNull()
    expect(readTextSize('')).toBeNull()
  })

  it('says what to do for each kind of mistake', () => {
    expect(textSizeError('  ')).toBe('Enter a text size')
    expect(textSizeError('12.5')).toBe(
      'Enter the text size as a whole number, like 125'
    )
    expect(textSizeError('99')).toBe('Enter a text size from 100 to 200')
    expect(textSizeError('201')).toBe('Enter a text size from 100 to 200')
    expect(textSizeError('100')).toBeNull()
    expect(textSizeError('200')).toBeNull()
  })

  it('collects every error, in form order', () => {
    expect(formErrors({ textSize: '150' })).toEqual({})
    const errors = formErrors({ textSize: '' })
    expect(errors).toEqual({ textSize: 'Enter a text size' })
    expect(errorList(errors)).toEqual([
      { field: 'textSize', message: 'Enter a text size' }
    ])
    expect(errorList({})).toEqual([])
  })
})
