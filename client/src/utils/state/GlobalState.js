import React, { createContext, useContext } from 'react';
import { useGlobalReducer } from './reducers';

const StoreContext = createContext();
const { Provider } = StoreContext;

const StoreProvider = ({ value = [], ...props }) => {
  const [state, dispatch] = useGlobalReducer({
    modalVisible: false,
    leftSidebarCollapsed: false,
    searchedRecipes: [],
    homeRecipes: [],
    savedRecipes: [],
    customRecipe: null
  });

  return <Provider value={[state, dispatch]} {...props} />;
};

const useStoreContext = () => {
  return useContext(StoreContext);
};

export { StoreProvider, useStoreContext };
