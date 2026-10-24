import { chip } from '../renderList'
import { resetViewport, setViewportWidth } from '../media'

describe('test helpers', () => {
  it('say clearly when a chip is missing', () => {
    expect(() => chip('nothing')).toThrow('no chip nothing')
  })

  it('the fake matchMedia keeps the old listener API as no-ops', () => {
    setViewportWidth(600)
    const list = window.matchMedia('(min-width: 576px)')
    expect(list.matches).toBe(true)
    expect(list.media).toBe('(min-width: 576px)')
    list.addListener(null)
    list.removeListener(null)
    resetViewport()
    expect(typeof window.matchMedia).toBe('undefined')
  })
})
