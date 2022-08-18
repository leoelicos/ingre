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
  console.log('action = ', action);

  switch (action.type) {
    case SHOW_MODAL:
      return { ...state, modalVisible: true };
    case HIDE_MODAL:
      return { ...state, modalVisible: false };

    case TOGGLE_SIDEBAR:
      console.log('reducing TOGGLE_SIDEBAR');
      return { ...state, leftSidebarCollapsed: !state.leftSidebarCollapsed };

    case UPDATE_SEARCH_RECIPES:
      console.log(`reducer UPDATE_SEARCH_RECIPES from ${state.searchRecipes.length} items to ${action.data.length} items`);
      return { ...state, searchRecipes: action.data };

    case UPDATE_HOME_RECIPES:
      console.log(`reducer UPDATE_HOME_RECIPES from ${state.homeRecipes.length} items to ${action.data.length} items`);
      return { ...state, homeRecipes: action.data };

    case ADD_SAVED_RECIPE:
      console.log(`reducer ADD_SAVED_RECIPE with this id:\n${action.data._id}`);
      if (state.savedRecipes.find((r) => r._id === action.data._id)) {
        console.log(`Already saved!!`);
        return { ...state };
      }

      const newSavedRecipes = JSON.parse(JSON.stringify(state.savedRecipes));
      newSavedRecipes.push(action.data);
      return { ...state, savedRecipes: newSavedRecipes };

    case ADD_EDIT_RECIPE:
      console.log(`reducer ADD_EDIT_RECIPE with this recipe:\n${action.data.name}`);
      const newEditRecipe = action.data;
      console.log('newEditRecipe = ', newEditRecipe);
      return { ...state, customRecipe: newEditRecipe };

    case CLEAR_EDIT_RECIPE:
      console.log(`reducer CLEAR_EDIT_RECIPE  :\n `);

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
