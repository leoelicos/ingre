import { useGlobalReducer } from './reducers'
import type { StoreAction } from './reducers'
import type { FC, ReactNode, Dispatch } from 'react'
import { createContext, useContext } from 'react'
import type { ClientRecipe } from '../../types/client'

export interface Store {
  modalVisible: boolean
  leftSidebarCollapsed: boolean
  searchRecipes: ClientRecipe[]
  savedRecipes: ClientRecipe[]
  savedDidMount: boolean
}

type StoreContextType = [state: Store, dispatch: Dispatch<StoreAction>]

const initialState: Store = {
  modalVisible: false,
  leftSidebarCollapsed: false,
  searchRecipes: [],
  savedRecipes: [],
  savedDidMount: false
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
