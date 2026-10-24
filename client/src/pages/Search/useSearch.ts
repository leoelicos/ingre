import { useEffect, useState } from 'react'
import type { ClientRecipe } from '../../types/client'
import searchLibrary from '../../utils/library/recipeLibrary'
import { changeTitle } from '../../utils/changeTitle'
import { useStoreContext } from '../../utils/state/GlobalState'
import { UPDATE_SEARCH_RECIPES } from '../../utils/state/actions'

type SearchHandlerType = (value: string, event?: { target?: unknown }) => void

export const useSearch = () => {
  const [state, dispatch] = useStoreContext()
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [libraryRecipes, setLibraryRecipes] = useState<ClientRecipe[]>(
    state.searchRecipes
  )
  const [updateRecipes, setUpdateRecipes] = useState(false)
  const [searchText, setSearchText] = useState<string>('')

  const handleFormSubmit: SearchHandlerType = async (q, event) => {
    if (!event) return
    try {
      setLoadingRecipes(true)
      const hits = searchLibrary({ q })
      setLibraryRecipes(hits)
      setUpdateRecipes(true)
      setLoadingRecipes(false)
    } catch (e) {
      console.error(e)
      setLoadingRecipes(false)
    }
  }

  const onSearchChange = (e: { target: { value: string } }) => {
    setSearchText(e.target.value)
  }
  // Store results in global state
  useEffect(() => {
    if (updateRecipes) {
      dispatch({ type: UPDATE_SEARCH_RECIPES, data: libraryRecipes })
      setUpdateRecipes(false)
    }
  }, [updateRecipes, libraryRecipes, dispatch])

  useEffect(() => {
    changeTitle('Search')
  }, [])
  return {
    searchText,
    onSearchChange,
    loadingRecipes,
    libraryRecipes,
    handleFormSubmit
  }
}
