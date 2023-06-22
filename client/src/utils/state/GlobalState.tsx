import React, { FC, ReactNode, createContext, useContext } from 'react'
import { useGlobalReducer } from './reducers.ts'

interface Store {
  modalVisible: boolean
  leftSidebarCollapsed: boolean
  searchRecipes: any[]
  homeRecipes: any[]
  savedRecipes: any[]
  customiseRecipe: null
  homeDidMount: boolean
  savedIngredients: any[]
  savedDidMount: boolean
  ingredientsDidGenerate: boolean
  tapOff: any[]
}

type StoreContextType = [state: Store, dispatch: React.Dispatch<any>]

const StoreContext = createContext<StoreContextType | null>(null)

const initialState: Store = {
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
  tapOff: []
}
const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useGlobalReducer(initialState)

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  )
}

const useStoreContext = () => {
  return useContext(StoreContext)
}

export { StoreProvider, useStoreContext }
