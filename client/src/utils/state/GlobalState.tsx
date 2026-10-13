import { useGlobalReducer } from './reducers'
import type { FC, ReactNode, Dispatch } from 'react'
import { createContext, useContext } from 'react'
import type { ClientRecipe } from '../../types/client'

export interface Store {
  modalVisible: boolean
  leftSidebarCollapsed: boolean
  searchRecipes: ClientRecipe[]
  homeRecipes: ClientRecipe[]
  savedRecipes: ClientRecipe[]
  customiseRecipe: {
    _id: string
    name: string
    portions: string
    ingredients: Array<{
      _id: string
      name: string
      quantity: number
      measure: string
      category: string
    }>
    picture_url: string
    edamamId: string
    instructions: string
  }
  homeDidMount: boolean
  savedIngredients: unknown[]
  savedDidMount: boolean
  ingredientsDidGenerate: boolean
  tapOff: unknown[]
}

type StoreContextType = [state: Store, dispatch: Dispatch<{ type: string; data: unknown }>]

const initialState: Store = {
  modalVisible: false,
  leftSidebarCollapsed: false,
  searchRecipes: [],
  homeRecipes: [],
  savedRecipes: [],
  customiseRecipe: {
    _id: '',
    name: '',
    portions: '',
    ingredients: [],
    picture_url: '',
    edamamId: '',
    instructions: ''
  },
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
