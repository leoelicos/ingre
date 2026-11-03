import { holdsEveryWord, matchedAlias, namesOf } from '../aliases'

const coriander = {
  name: 'fresh coriander',
  aliases: ['cilantro', 'Chinese parsley']
}

describe('aliases (#239)', () => {
  it('lists the name first, then the aliases', () => {
    expect(namesOf(coriander)).toEqual([
      'fresh coriander',
      'cilantro',
      'Chinese parsley'
    ])
    expect(namesOf({ name: 'salt' })).toEqual(['salt'])
  })

  it('holds every word, ignoring case and plurals', () => {
    expect(holdsEveryWord('Chinese parsley', 'chinese PARSLEYS')).toBe(true)
    expect(holdsEveryWord('Chinese parsley', 'chinese basil')).toBe(false)
  })

  it('names the alias that matched when the name did not', () => {
    expect(matchedAlias(coriander, 'cilantro')).toBe('cilantro')
    expect(matchedAlias(coriander, 'chinese')).toBe('Chinese parsley')
  })

  it('says nothing when the name matches, or nothing matches, or there are no aliases', () => {
    expect(matchedAlias(coriander, 'coriander')).toBeNull()
    expect(matchedAlias(coriander, 'basil')).toBeNull()
    expect(matchedAlias({ name: 'salt' }, 'sea')).toBeNull()
  })
})
