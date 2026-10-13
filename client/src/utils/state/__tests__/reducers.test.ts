import { reducer } from '../reducers'
import { UPDATE_SEARCH_RECIPES, FLAG_HOME_MOUNTED } from '../actions'
import type { Store } from '../GlobalState'

const initialState: Store = {
  modalVisible: false,
  leftSidebarCollapsed: false,
  searchRecipes: [],
  homeRecipes: [],
  savedRecipes: [],
  customiseRecipe: {
    _id: '',
    name: '',
    portions: '',
    ingredients: [],
    picture_url: '',
    edamamId: '',
    instructions: ''
  },
  homeDidMount: false,
  savedIngredients: [],
  savedDidMount: false,
  ingredientsDidGenerate: false,
  tapOff: []
}

describe('reducer', () => {
  it('updates search recipes', () => {
    const action = { type: UPDATE_SEARCH_RECIPES, data: [{ name: 'test' }] }
    const result = reducer(initialState, action as any)
    expect(result.searchRecipes).toEqual([{ name: 'test' }])
  })

  it('flags home mounted', () => {
    const result = reducer(initialState, { type: FLAG_HOME_MOUNTED })
    expect(result.homeDidMount).toBe(true)
  })

  it('returns state for unknown action', () => {
    const result = reducer(initialState, { type: 'UNKNOWN' })
    expect(result).toBe(initialState)
  })
})
