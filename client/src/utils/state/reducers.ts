import { useReducer } from 'react'
import type { Store } from './GlobalState'
import { isClientRecipe, isClientRecipeList } from './guards'

import {
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
} from './actions'

export type StoreAction = { type: string; data?: unknown }

export const reducer = (state: Store, action: StoreAction): Store => {
  switch (action.type) {
    case UPDATE_SEARCH_RECIPES:
      if (!isClientRecipeList(action.data)) return state
      return { ...state, searchRecipes: action.data }

    case UPDATE_HOME_RECIPES:
      if (!isClientRecipeList(action.data)) return state
      return { ...state, homeRecipes: action.data }

    case UPDATE_SAVED_RECIPES:
      if (action.data === undefined) return { ...state, savedRecipes: [] }
      if (!isClientRecipeList(action.data)) return state
      return { ...state, savedRecipes: action.data }

    case UPDATE_SAVED_INGREDIENTS:
      if (action.data === undefined) return { ...state, savedIngredients: [] }
      if (!Array.isArray(action.data)) return state
      return { ...state, savedIngredients: action.data }

    case UPDATE_TAP_OFF: {
      if (!Array.isArray(action.data)) return state
      return { ...state, tapOff: action.data }
    }

    case ADD_SAVED_RECIPE: {
      if (!isClientRecipe(action.data)) return state
      const incoming = action.data
      if (state.savedRecipes.some((r) => r.libraryId === incoming.libraryId)) {
        return state
      }
      return { ...state, savedRecipes: [...state.savedRecipes, incoming] }
    }

    case REMOVE_SAVED_RECIPE: {
      if (typeof action.data !== 'string') return state
      const libraryId = action.data
      return {
        ...state,
        savedRecipes: state.savedRecipes.filter(
          (r) => r.libraryId !== libraryId
        )
      }
    }

    case SET_EDIT_RECIPE:
      if (action.data === null) return { ...state, customiseRecipe: null }
      if (!isClientRecipe(action.data)) return state
      return { ...state, customiseRecipe: action.data }

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

export function useGlobalReducer(initialState: Store) {
  return useReducer(reducer, initialState)
}
