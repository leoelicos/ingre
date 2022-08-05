import { useReducer } from 'react';
import {
  SHOW_MODAL,
  HIDE_MODAL,
  SHOW_SIDEBAR,
  HIDE_SIDEBAR

  //
} from './actions';

// The reducer is a function that accepts the current state and an action. It returns a new state based on that action.
export const reducer = (state, action) => {
  switch (action.type) {
    case SHOW_MODAL:
      return { ...state, modalVisible: true };
    case HIDE_MODAL:
      return { ...state, modalVisible: false };

    case SHOW_SIDEBAR:
      return { ...state, leftSidebarCollapsed: false };

    case HIDE_SIDEBAR:
      return { ...state, leftSidebarCollapsed: true };

    default:
      return state;
  }
};

export function useGlobalReducer(initialState) {
  return useReducer(reducer, initialState);
}
