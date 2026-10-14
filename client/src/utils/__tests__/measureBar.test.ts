import { BOTTOM_BAR, measureBar } from '../measureBar'

describe('measureBar', () => {
  it('writes the element height to a CSS variable; ignores detach', () => {
    const bar = document.createElement('div')
    Object.defineProperty(bar, 'offsetHeight', { value: 73 })
    measureBar(BOTTOM_BAR)(bar)
    expect(document.documentElement.style.getPropertyValue(BOTTOM_BAR)).toBe(
      '73px'
    )
    measureBar(BOTTOM_BAR)(null)
    expect(document.documentElement.style.getPropertyValue(BOTTOM_BAR)).toBe(
      '73px'
    )
  })
})
