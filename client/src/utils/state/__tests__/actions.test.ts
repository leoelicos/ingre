import * as actions from '../actions'

describe('actions', () => {
  it('exports action constants', () => {
    expect(actions.UPDATE_SEARCH_RECIPES).toBe('UPDATE_SEARCH_RECIPES')
    expect(actions.UPDATE_SAVED_RECIPES).toBe('UPDATE_SAVED_RECIPES')
  })
})
