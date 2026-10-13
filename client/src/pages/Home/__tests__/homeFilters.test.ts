import { toggleTag } from '../homeFilters'

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
