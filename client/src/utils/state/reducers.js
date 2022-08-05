import { useReducer } from 'react';
import {
  SHOW_MODAL,
  HIDE_MODAL,
  TOGGLE_SIDEBAR

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

    default:
      return state;
  }
};

export function useGlobalReducer(initialState) {
  return useReducer(reducer, initialState);
}
