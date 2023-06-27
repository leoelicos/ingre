import React, { FC, ReactNode, createContext, useContext } from 'react'
import { useGlobalReducer } from './reducers.ts'

interface Store {
  modalVisible: boolean
  leftSidebarCollapsed: boolean
  searchRecipes: any[]
  homeRecipes: any[]
  savedRecipes: any[]
  customiseRecipe: {
    _id?: boolean
    name?: string
    portions?: number
    ingredients?: {
      _id: string
      name: string
      quantity: number
      measure: string
      category: {
        name: string
      }
    }[]
    picture_url?: string
    edamamId?: string
    instructions?: string
  }
  homeDidMount: boolean
  savedIngredients: any[]
  savedDidMount: boolean
  ingredientsDidGenerate: boolean
  tapOff: any[]
}

type StoreContextType = [state: Store, dispatch: React.Dispatch<any>]

const initialState: Store = {
  modalVisible: false,
  leftSidebarCollapsed: false,
  searchRecipes: [],
  homeRecipes: [],
  savedRecipes: [],
  customiseRecipe: {},
  homeDidMount: false,
  savedIngredients: [],
  savedDidMount: false,
  ingredientsDidGenerate: false,
  tapOff: []
}
const StoreContext = createContext<StoreContextType>([initialState, () => {}])

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
