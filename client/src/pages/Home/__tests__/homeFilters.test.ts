import { orderTags, tagLabel, toggleTag, visibleTags } from '../homeFilters'

describe('toggleTag', () => {
  it('adds a missing tag without mutating the input', () => {
    const selected = ['dinner']
    expect(toggleTag(selected, 'Indian')).toEqual(['dinner', 'Indian'])
    expect(selected).toEqual(['dinner'])
  })
  it('removes a present tag', () => {
    expect(toggleTag(['dinner', 'Indian'], 'dinner')).toEqual(['Indian'])
  })
})

describe('tag display', () => {
  it('orders meal and diet tags first, then cuisines alphabetically', () => {
    expect(orderTags(['Thai', 'vegan', 'Indian', 'dinner'])).toEqual([
      'dinner',
      'vegan',
      'Indian',
      'Thai'
    ])
  })
  it('capitalises the first letter only', () => {
    expect(tagLabel('gluten-free')).toBe('Gluten-free')
  })
})

describe('visibleTags', () => {
  const tags = ['lunch', 'Dinner', 'Indian', 'Thai']
  it('collapsed shows primary tags and active ones; expanded shows all', () => {
    expect(visibleTags(tags, ['Thai'], true)).toEqual([
      'lunch',
      'Dinner',
      'Thai'
    ])
    expect(visibleTags(tags, [], false)).toEqual(tags)
  })
})
