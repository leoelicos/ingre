import React, { createContext, useContext } from 'react'
import { useGlobalReducer } from './reducers'

const StoreContext = createContext()
const { Provider } = StoreContext

const StoreProvider = ({ value = [], ...props }) => {
  const initialState = {
    modalVisible: false,
    leftSidebarCollapsed: false,
    searchRecipes: [],
    homeRecipes: [],
    savedRecipes: [],
    customiseRecipe: null,
    homeDidMount: false,
    savedIngredients: [],
    savedDidMount: false,
    ingredientsDidGenerate: false,
    tapOff: null
  }
  const [state, dispatch] = useGlobalReducer(initialState)

  return (
    <Provider
      value={[state, dispatch]}
      {...props}
    />
  )
}

const useStoreContext = () => {
  return useContext(StoreContext)
}

export { StoreProvider, useStoreContext }
