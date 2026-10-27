import {
  disconnected,
  fakeObserver,
  fire,
  margins,
  resetObserver
} from '../observer'

afterEach(resetObserver)

describe('the IntersectionObserver stand-in', () => {
  it('records what it watches and sends entries by id', () => {
    fakeObserver()
    const seen: boolean[] = []
    const target = document.createElement('div')
    target.id = 'watched'
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => seen.push(entry.isIntersecting)),
      { rootMargin: '1px' }
    )
    observer.observe(target)
    expect(margins.get('watched')).toBe('1px')
    fire('watched', { isIntersecting: true })
    expect(seen).toEqual([true])
    observer.unobserve(target)
    expect(observer.takeRecords()).toEqual([])
    observer.disconnect()
    expect(disconnected).toEqual(['watched'])
    expect(() => fire('nobody', {})).toThrow('nothing watches #nobody')
  })

  it('defaults to no root margin and goes back to none', () => {
    fakeObserver()
    const target = document.createElement('div')
    target.id = 'plain'
    new IntersectionObserver(() => []).observe(target)
    expect(margins.get('plain')).toBe('')
    resetObserver()
    expect(window.IntersectionObserver).toBeUndefined()
  })
})
