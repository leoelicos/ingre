import { useReducer } from 'react';
import {
  SHOW_MODAL,
  HIDE_MODAL,
  TOGGLE_SIDEBAR,
  UPDATE_SEARCH_RECIPES,
  UPDATE_HOME_RECIPES,
  ADD_SAVED_RECIPE,
  ADD_EDIT_RECIPE,
  CLEAR_EDIT_RECIPE,
  FLAG_HOME_MOUNTED
  //
} from './actions';

// The reducer is a function that accepts the current state and an action. It returns a new state based on that action.
export const reducer = (state, action) => {
  console.log(action);

  switch (action.type) {
    case SHOW_MODAL:
      return { ...state, modalVisible: true };
    case HIDE_MODAL:
      return { ...state, modalVisible: false };

    case TOGGLE_SIDEBAR:
      return { ...state, leftSidebarCollapsed: !state.leftSidebarCollapsed };

    case UPDATE_SEARCH_RECIPES:
      return { ...state, searchRecipes: action.data };

    case UPDATE_HOME_RECIPES:
      return { ...state, homeRecipes: action.data };

    case ADD_SAVED_RECIPE:
      if (state.savedRecipes.find((r) => r._id === action.data._id)) {
        console.log(`Already saved!!`);
        return { ...state };
      }

      const newSavedRecipes = JSON.parse(JSON.stringify(state.savedRecipes));
      newSavedRecipes.push(action.data);
      return { ...state, savedRecipes: newSavedRecipes };

    case ADD_EDIT_RECIPE:
      const newEditRecipe = action.data;
      return { ...state, customRecipe: newEditRecipe };

    case CLEAR_EDIT_RECIPE:
      return { ...state, customRecipe: null };

    case FLAG_HOME_MOUNTED:
      return { ...state, homeDidMount: true };
    default:
      return state;
  }
};

export function useGlobalReducer(initialState) {
  return useReducer(reducer, initialState);
}
