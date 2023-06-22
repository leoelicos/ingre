import React, { createContext, useContext } from 'react'
import { useGlobalReducer } from './reducers.ts'

interface StoreProviderValueType {
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

type StoreProviderProps = StoreProviderValueType

type StoreContextType = [
  state: StoreProviderValueType,
  dispatch: React.Dispatch<any>
]

const StoreContext = createContext<StoreContextType | null>(null)

const initialState: StoreProviderValueType = {
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
const StoreProvider = (value: StoreProviderProps = initialState) => {
  const [state, dispatch] = useGlobalReducer(value)

  return <StoreContext.Provider value={[state, dispatch]} />
}

const useStoreContext = () => {
  return useContext(StoreContext)
}

export { StoreProvider, useStoreContext }
