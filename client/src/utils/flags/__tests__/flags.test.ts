import {
  FLAGS_KEY,
  flagsFromSearch,
  isEnabled,
  parseFlags,
  resolveFlags
} from '../flags'

const memory = (): Storage => {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value)
  }
}

describe('feature flags (#208)', () => {
  it('are all off until someone turns them on', () => {
    expect(isEnabled('tiers', resolveFlags('', memory()))).toBe(false)
  })

  it('knows tiers, seasonality and the stubbed micropayments', () => {
    expect(parseFlags(['tiers', 'seasonality', 'micropayments'])).toEqual([
      'tiers',
      'seasonality',
      'micropayments'
    ])
  })

  it('parseFlags keeps the known flags and drops the rest', () => {
    expect(parseFlags(['tiers', 'nope', 3])).toEqual(['tiers'])
    expect(parseFlags('tiers')).toBeNull()
  })

  it('flagsFromSearch reads ?flags=a,b and ignores unknown names', () => {
    expect(flagsFromSearch('?flags=tiers,bogus')).toEqual(['tiers'])
    expect(flagsFromSearch('?flags=')).toEqual([])
    expect(flagsFromSearch('?x=1')).toBeNull()
  })

  it('?flags= turns flags on and remembers them', () => {
    const storage = memory()
    expect(resolveFlags('?flags=tiers', storage)).toEqual(['tiers'])
    expect(storage.getItem(FLAGS_KEY)).toBe('["tiers"]')
    // a later page with no query keeps them
    expect(resolveFlags('', storage)).toEqual(['tiers'])
  })

  it('an empty ?flags= turns them all off again', () => {
    const storage = memory()
    resolveFlags('?flags=tiers', storage)
    expect(resolveFlags('?flags=', storage)).toEqual([])
    expect(resolveFlags('', storage)).toEqual([])
  })

  it('isEnabled asks about one flag', () => {
    expect(isEnabled('tiers', ['tiers'])).toBe(true)
    expect(isEnabled('tiers', [])).toBe(false)
  })
})
