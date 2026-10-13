import * as actions from '../actions'

describe('actions', () => {
  it('exports action constants', () => {
    expect(actions.UPDATE_SEARCH_RECIPES).toBe('UPDATE_SEARCH_RECIPES')
    expect(actions.FLAG_HOME_MOUNTED).toBe('FLAG_HOME_MOUNTED')
    expect(actions.UPDATE_SAVED_RECIPES).toBe('UPDATE_SAVED_RECIPES')
  })
})
