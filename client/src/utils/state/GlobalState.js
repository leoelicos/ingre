import React, { createContext, useContext } from 'react';
import { useGlobalReducer } from './reducers';

const StoreContext = createContext();
const { Provider } = StoreContext;

const StoreProvider = ({ value = [], ...props }) => {
  const initialState = {
    modalVisible: false,
    leftSidebarCollapsed: false,
    searchRecipes: [],
    homeRecipes: [],
    savedRecipes: [],
    customRecipe: null,
    homeDidMount: false
  };
  const [state, dispatch] = useGlobalReducer(initialState);

  return <Provider value={[state, dispatch]} {...props} />;
};

const useStoreContext = () => {
  return useContext(StoreContext);
};

export { StoreProvider, useStoreContext };
