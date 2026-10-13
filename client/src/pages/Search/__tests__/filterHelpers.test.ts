import {
  buildFilterState,
  emptyFilterState,
  filterTags,
  pickOption
} from '../useSearch'

describe('pickOption', () => {
  it('returns the value when it is an allowed option', () => {
    expect(pickOption({ k: 'a' }, 'k', ['a', 'b'])).toEqual(['a'])
  })
  it('returns [] for unknown, missing or non-string values', () => {
    expect(pickOption({ k: 'z' }, 'k', ['a'])).toEqual([])
    expect(pickOption({}, 'k', ['a'])).toEqual([])
    expect(pickOption({ k: 1 }, 'k', ['a'])).toEqual([])
  })
})

describe('emptyFilterState', () => {
  it('returns a fresh empty object each call', () => {
    expect(emptyFilterState()).toEqual(buildFilterState(null))
    expect(emptyFilterState()).not.toBe(emptyFilterState())
  })
})

describe('filterTags', () => {
  it('flattens every category in order', () => {
    expect(
      filterTags(
        buildFilterState({
          diet: 'low-fat',
          health: 'vegan',
          'cuisine-type': 'Indian',
          'meal-type': 'Dinner',
          'dish-type': 'Soup'
        })
      )
    ).toEqual(['low-fat', 'vegan', 'Indian', 'Dinner', 'Soup'])
  })
})
