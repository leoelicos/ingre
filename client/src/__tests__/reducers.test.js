import { reducer } from '../utils/state/reducers'
import {
  //
  SHOW_DRAWER,
  HIDE_DRAWER
  /*   TOGGLE_SIDEBAR,
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
  UPDATE_SEARCH_RECIPES,
  UPDATE_HOME_RECIPES,
  UPDATE_SAVED_RECIPES,
  UPDATE_SAVED_INGREDIENTS,
  UPDATE_TAP_OFF,
  ADD_SAVED_RECIPE,
  REMOVE_SAVED_RECIPE,
  ADD_EDIT_RECIPE,
  CLEAR_EDIT_RECIPE,
  FLAG_HOME_MOUNTED,
  FLAG_SAVED_MOUNTED,
  FLAG_INGREDIENTS_GENERATED */
} from '../utils/state/actions'

const initialState = {
  modalVisible: false,
  leftSidebarCollapsed: false,
  searchRecipes: [],
  homeRecipes: [],
  savedRecipes: [],
  customiseRecipe: null,
  homeDidMount: false,
  savedIngredients: [],
  savedDidMount: false,
  ingredientsDidGenerate: false,
  tapOff: null
}

test('SHOW_DRAWER', () => {
  let newState = reducer(initialState, {
    type: SHOW_DRAWER
  })
  expect(newState.modalVisible).toBe(true)
})

test('HIDE_DRAWER', () => {
  let newState = reducer(initialState, {
    type: HIDE_DRAWER
  })
  expect(newState.modalVisible).toBe(false)
})
