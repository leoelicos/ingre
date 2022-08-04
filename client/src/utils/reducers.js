import { useReducer } from 'react';
import { TOGGLE_COLLAPSED } from './actions';

// The reducer is a function that accepts the current state and an action. It returns a new state based on that action.
export const reducer = (state, action) => {
  switch (action.type) {
    case TOGGLE_COLLAPSED:
      return {
        ...state,
        collapsed: !state.collapsed
      };

    default:
      return state;
  }
};

export function useGlobalReducer(initialState) {
  return useReducer(reducer, initialState);
}
