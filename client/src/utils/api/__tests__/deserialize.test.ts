import deserialize from '../deserialize'

describe('deserialize', () => {
  it('handles empty response', () => {
    expect(deserialize([])).toEqual([])
  })
})
