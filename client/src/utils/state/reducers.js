import { useReducer } from 'react';
import {
  SHOW_MODAL,
  HIDE_MODAL,
  TOGGLE_SIDEBAR,
  UPDATE_SEARCHED_RECIPES,
  UPDATE_HOME_RECIPES
  //
} from './actions';

// The reducer is a function that accepts the current state and an action. It returns a new state based on that action.
export const reducer = (state, action) => {
  switch (action.type) {
    case SHOW_MODAL:
      return { ...state, modalVisible: true };
    case HIDE_MODAL:
      return { ...state, modalVisible: false };

    case TOGGLE_SIDEBAR:
      console.log('reducing TOGGLE_SIDEBAR');
      return { ...state, leftSidebarCollapsed: !state.leftSidebarCollapsed };

    case UPDATE_SEARCHED_RECIPES:
      console.log(`reducer UPDATE_SEARCHED_RECIPES from ${state.searchedRecipes.length} items to ${action.data.length} items`);
      return { ...state, searchedRecipes: action.data };

    case UPDATE_HOME_RECIPES:
      console.log(`reducer UPDATE_HOME_RECIPES from ${state.homeRecipes.length} items to ${action.data.length} items`);
      return { ...state, homeRecipes: action.data };

    default:
      return state;
  }
};

export function useGlobalReducer(initialState) {
  return useReducer(reducer, initialState);
}
