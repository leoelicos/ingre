import { useReducer } from 'react'

import {
  SHOW_DRAWER,
  HIDE_DRAWER,
  TOGGLE_SIDEBAR,
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
  UPDATE_SEARCH_RECIPES,
  UPDATE_HOME_RECIPES,
  UPDATE_SAVED_RECIPES,
  UPDATE_SAVED_INGREDIENTS,
  UPDATE_TAP_OFF,
  ADD_SAVED_RECIPE,
  REMOVE_SAVED_RECIPE,
  SET_EDIT_RECIPE,
  CLEAR_EDIT_RECIPE,
  FLAG_HOME_MOUNTED,
  FLAG_SAVED_MOUNTED,
  FLAG_INGREDIENTS_GENERATED
} from './actions.ts'

// The reducer is a function that accepts the current state and an action. It returns a new state based on that action.
export const reducer: (
  state: any,
  action: { type: string; data: any }
) => any = (state, action) => {
  // console.log(action.type);
  console.log(`REDUCER\t[${action.type}]`, action.data)

  switch (action.type) {
    case SHOW_DRAWER:
      return { ...state, modalVisible: true }
    case HIDE_DRAWER:
      return { ...state, modalVisible: false }

    case TOGGLE_SIDEBAR:
      return { ...state, leftSidebarCollapsed: !state.leftSidebarCollapsed }

    case EXPAND_SIDEBAR:
      return { ...state, leftSidebarCollapsed: false }
    case COLLAPSE_SIDEBAR:
      return { ...state, leftSidebarCollapsed: true }

    case UPDATE_SEARCH_RECIPES:
      return { ...state, searchRecipes: action.data }

    case UPDATE_HOME_RECIPES:
      return { ...state, homeRecipes: action.data }

    case UPDATE_SAVED_RECIPES:
      if (action.data === undefined) return { ...state, savedRecipes: [] }
      return { ...state, savedRecipes: action.data }

    case UPDATE_SAVED_INGREDIENTS:
      if (action.data === undefined) return { ...state, savedIngredients: [] }
      return { ...state, savedIngredients: action.data }

    case UPDATE_TAP_OFF: {
      if (!action.data) return { ...state }
      return { ...state, tapOff: action.data }
    }

    case ADD_SAVED_RECIPE:
      // console.log('state.savedRecipes before', state.savedRecipes);
      if (
        state.savedRecipes.find(
          (r: { edamamId: string }) => r.edamamId === action.data.edamamId
        )
      )
        return { ...state }
      let newSavedRecipes = JSON.parse(JSON.stringify(state.savedRecipes))
      newSavedRecipes.push(action.data)
      // console.log('state.savedRecipes after', newSavedRecipes);
      return { ...state, savedRecipes: newSavedRecipes }

    case REMOVE_SAVED_RECIPE:
      const copyOfRecipes: { edamamId: string }[] = JSON.parse(
        JSON.stringify(state.savedRecipes)
      )
      // console.log('copyOfRecipes', copyOfRecipes);
      const filteredCopyOfRecipes = copyOfRecipes.filter(
        (r) => r.edamamId !== action.data
      )
      // console.log('filteredCopyOfRecipes', filteredCopyOfRecipes);
      return { ...state, savedRecipes: filteredCopyOfRecipes }

    case SET_EDIT_RECIPE:
      const newEditRecipe = action.data
      return { ...state, customiseRecipe: newEditRecipe }

    case CLEAR_EDIT_RECIPE:
      return { ...state, customiseRecipe: null }

    case FLAG_HOME_MOUNTED:
      return { ...state, homeDidMount: true }

    case FLAG_SAVED_MOUNTED:
      return { ...state, savedDidMount: true }

    case FLAG_INGREDIENTS_GENERATED:
      return { ...state, ingredientsDidGenerate: true }

    default:
      return state
  }
}

export function useGlobalReducer(initialState: any) {
  return useReducer(reducer, initialState)
}
