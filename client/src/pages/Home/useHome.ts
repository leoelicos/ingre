import { useEffect, useState } from 'react'
import searchLibrary from '../../utils/library/recipeLibrary'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import { useStoreContext } from '../../utils/state/GlobalState'
import {
  FLAG_HOME_MOUNTED,
  UPDATE_HOME_RECIPES
} from '../../utils/state/actions'

const REFRESH_TAGS = ['vegetarian', 'vegan', 'breakfast', 'lunch', 'dinner']

export const useHome = () => {
  useEffect(() => {
    changeTitle('Recipes')
  }, [])

  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn
  const firstName = auth.profile?.data.firstName || 'chef'

  const [state, dispatch] = useStoreContext()
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [libraryRecipes, setLibraryRecipes] = useState(state.homeRecipes)
  const [updateRecipes, setUpdateRecipes] = useState(false)

  const handleRefresh = async (query: string) => {
    try {
      setLoadingRecipes(true)
      const tags = REFRESH_TAGS.includes(query) ? [query] : []
      const hits = searchLibrary({ tags })
      setLibraryRecipes(hits)
      setLoadingRecipes(false)
      setUpdateRecipes(true)
    } catch (e) {
      console.error(e)
      setLoadingRecipes(false)
    }
  }

  useEffect(() => {
    if (updateRecipes) {
      dispatch({ type: UPDATE_HOME_RECIPES, data: libraryRecipes })
      setUpdateRecipes(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateRecipes, libraryRecipes])

  // load the local library on first load
  useEffect(() => {
    const fetchOnFirstLoad = async () => {
      if (state.homeDidMount === false) {
        dispatch({ type: FLAG_HOME_MOUNTED, data: undefined })
        try {
          setLoadingRecipes(true)
          const hits = searchLibrary({})
          setLibraryRecipes(hits)
          setLoadingRecipes(false)
          setUpdateRecipes(true)
        } catch (e) {
          console.error(e)
        }
      }
    }
    fetchOnFirstLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.homeDidMount])

  return { loggedIn, firstName, loadingRecipes, libraryRecipes, handleRefresh }
}
