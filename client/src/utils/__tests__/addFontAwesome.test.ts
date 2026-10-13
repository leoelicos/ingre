import { addFontAwesome } from '../addFontAwesome'

describe('addFontAwesome', () => {
  it('does not throw', () => {
    expect(() => addFontAwesome()).not.toThrow()
  })
})
