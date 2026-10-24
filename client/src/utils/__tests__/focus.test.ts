import {
  focusById,
  focusCheckedIn,
  prefersReducedMotion,
  revealById,
  scrollBehaviour
} from '../focus'

const reduced = (matches: boolean) => () => {
  const list = new EventTarget()
  return Object.assign(list, {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener() {},
    removeListener() {}
  })
}

describe('focus helpers', () => {
  const original = window.matchMedia
  afterEach(() => {
    window.matchMedia = original
    document.body.innerHTML = ''
  })

  it('reads reduced motion, and assumes full motion without matchMedia', () => {
    expect(prefersReducedMotion()).toBe(false)
    expect(scrollBehaviour()).toBe('smooth')
    window.matchMedia = reduced(true)
    expect(prefersReducedMotion()).toBe(true)
    expect(scrollBehaviour()).toBe('auto')
    window.matchMedia = reduced(false)
    expect(scrollBehaviour()).toBe('smooth')
  })

  it('focuses by id, and does nothing when the id is missing', () => {
    document.body.innerHTML = '<button id="a">A</button>'
    focusById('missing')
    expect(document.activeElement).toBe(document.body)
    focusById('a')
    expect(document.activeElement?.id).toBe('a')
  })

  it('scrolls into view and focuses, and does nothing when missing', () => {
    document.body.innerHTML = '<button id="a">A</button>'
    const calls: ScrollIntoViewOptions[] = []
    Element.prototype.scrollIntoView = function (
      options?: boolean | ScrollIntoViewOptions
    ) {
      if (typeof options === 'object') calls.push(options)
    }
    revealById('missing')
    expect(calls).toEqual([])
    revealById('a')
    expect(calls).toEqual([{ block: 'nearest', behavior: 'smooth' }])
    expect(document.activeElement?.id).toBe('a')
  })

  it('focuses the checked radio in a group, if there is one', () => {
    document.body.innerHTML =
      '<div id="g"><input type="radio" name="r" id="x" /><input type="radio" name="r" id="y" checked /></div><div id="none"></div>'
    focusCheckedIn('missing')
    focusCheckedIn('none')
    expect(document.activeElement).toBe(document.body)
    focusCheckedIn('g')
    expect(document.activeElement?.id).toBe('y')
  })
})
