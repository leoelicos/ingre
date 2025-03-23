import { useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import { GET_SAVED_RECIPES } from 'lib/apollo/graphQL/queries'
import { changeTitle } from 'utils/changeTitle'
import { useStoreContext } from 'utils/state/GlobalState'
import { FLAG_SAVED_MOUNTED, UPDATE_SAVED_RECIPES } from 'utils/state/actions'

export const useSaved = () => {
  changeTitle('Search')

  const [getSavedRecipes, { loading, error, data }] = useLazyQuery(
    GET_SAVED_RECIPES,
    {
      fetchPolicy: 'network-only'
      // nextFetchPolicy: 'cache-first'
    }
  )
  const [state, dispatch] = useStoreContext()

  // update local savedRecipes when getSavedRecipes is loaded from server
  useEffect(() => {
    if (!loading && !error && data?.getSavedRecipes) {
      dispatch({ type: UPDATE_SAVED_RECIPES, data: data.getSavedRecipes })
    }
  }, [loading, error, data, dispatch])

  // run on first load
  useEffect(() => {
    if (state.savedDidMount === false) {
      dispatch({ type: FLAG_SAVED_MOUNTED })
      getSavedRecipes()
    }
  }, [state.savedDidMount])
  return { loading, error, savedRecipes: state.savedRecipes }
}
