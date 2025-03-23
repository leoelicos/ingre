import { useApolloClient } from '@apollo/client'
import { useEffect, useState } from 'react'
import { GET_APP_CREDENTIALS } from 'lib/apollo/graphQL/queries'
import fetchEdamam from 'utils/api/edamam'
import { changeTitle } from 'utils/changeTitle'
import { useStoreContext } from 'utils/state/GlobalState'
import { UPDATE_SEARCH_RECIPES } from 'utils/state/actions'
import type {
  cuisineType,
  dietType,
  dishType,
  filterTypes,
  healthType,
  mealType
} from './filter.d'

type SearchHandlerType = (
  value: string,
  event?:
    | React.ChangeEvent<HTMLInputElement>
    | React.MouseEvent<HTMLElement>
    | React.KeyboardEvent<HTMLInputElement>
) => void

export const useSearch = () => {
  const client = useApolloClient()
  const [state, dispatch] = useStoreContext()
  const [loadingEdamam, setLoadingEdamam] = useState(false)
  const [edamamRecipes, setEdamamRecipes] = useState<Array<any>>(
    state.searchRecipes
  )
  const blankForm = {
    diet: [],
    health: [],
    cuisineType: [],
    mealType: [],
    dishType: []
  }
  const [updateRecipes, setUpdateRecipes] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [filterState, setFilterState] = useState<filterTypes>(blankForm)

  const handleFormSubmit: SearchHandlerType = async (q, event) => {
    if (!event) return
    try {
      setLoadingEdamam(true)
      const res = await client.query({ query: GET_APP_CREDENTIALS })
      if (!res) throw new Error('[handleRefresh] GET_APP_CREDENTIALS error')
      const hits = await fetchEdamam({
        search: { ...filterState, q },
        appId: res.data.getApiKey.appId,
        appKey: res.data.getApiKey.appKey
      })
      setEdamamRecipes(hits)
      setUpdateRecipes(true)
      setLoadingEdamam(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleFilterChange = (event: any) => {
    const newState = event.reduce(
      (accumulator: filterTypes, curr: string[]) => {
        let key = curr[0]
        let val = curr[1]
        if (key === 'diet') accumulator.diet.push(val as dietType)
        else if (key === 'health') accumulator.health.push(val as healthType)
        else if (key === 'cuisine-type')
          accumulator.cuisineType.push(val as cuisineType)
        else if (key === 'meal-type') accumulator.mealType.push(val as mealType)
        else if (key === 'dish-type') accumulator.dishType.push(val as dishType)
        return accumulator
      },
      {
        diet: [],
        health: [],
        cuisineType: [],
        mealType: [],
        dishType: []
      }
    )
    setFilterState(newState)
  }

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }
  // Store results in global state
  useEffect(() => {
    if (updateRecipes) {
      dispatch({ type: UPDATE_SEARCH_RECIPES, data: edamamRecipes })
      setUpdateRecipes(false)
    }
  }, [updateRecipes, edamamRecipes, dispatch])

  useEffect(() => {
    changeTitle('Search')
  }, [])
  return {
    searchText,
    onSearchChange,
    loadingEdamam,
    edamamRecipes,
    handleFormSubmit,
    handleFilterChange
  }
}
