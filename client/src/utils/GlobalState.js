import React, { createContext, useContext } from 'react';
import { useGlobalReducer } from './reducers';
import searchEdamam from '../utils/API';

const StoreContext = createContext();
const { Provider } = StoreContext;
const recipeSeeds = searchEdamam();

const StoreProvider = ({ value = [], ...props }) => {
  const [state, dispatch] = useGlobalReducer({
    collapsed: false,
    homeRecipes: [],
    results: recipeSeeds
  });

  return <Provider value={[state, dispatch]} {...props} />;
};

const useStoreContext = () => {
  return useContext(StoreContext);
};

export { StoreProvider, useStoreContext };