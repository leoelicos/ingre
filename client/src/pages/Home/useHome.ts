import { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { GET_APP_CREDENTIALS } from 'lib/apollo/graphQL/queries'
import fetchEdamam from 'utils/api/edamam'
import { useAuthContext } from 'utils/auth/AuthContext'
import { changeTitle } from 'utils/changeTitle'
import { useStoreContext } from 'utils/state/GlobalState'
import { FLAG_HOME_MOUNTED, UPDATE_HOME_RECIPES } from 'utils/state/actions'

export const useHome = () => {
  useEffect(() => {
    changeTitle('Recipes')
  }, [])

  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn
  const firstName = auth.profile?.data.firstName || 'chef'

  const client = useApolloClient()

  const [state, dispatch] = useStoreContext()
  const [loadingEdamam, setLoadingEdamam] = useState(false)
  const [edamamRecipes, setEdamamRecipes] = useState(state.homeRecipes)
  const [updateRecipes, setUpdateRecipes] = useState(false)

  const handleRefresh = async (query: string) => {
    try {
      setLoadingEdamam(true)
      // get credentials from backend
      const { appId, appKey } = await getAppCredentials()
      let hits
      if (query === 'vegetarian') {
        hits = await fetchEdamam({
          search: { health: ['vegetarian'] },
          appId,
          appKey
        })
      } else if (query === 'vegan') {
        hits = await fetchEdamam({
          search: { health: ['vegan'] },
          appId,
          appKey
        })
      } else if (query === 'balanced') {
        hits = await fetchEdamam({
          search: { diet: ['balanced'] },
          appId,
          appKey
        })
      } else if (query === 'breakfast') {
        hits = await fetchEdamam({
          search: { mealType: ['breakfast'] },
          appId,
          appKey
        })
      } else if (query === 'lunch') {
        hits = await fetchEdamam({
          search: { mealType: ['lunch'] },
          appId,
          appKey
        })
      } else if (query === 'dinner') {
        hits = await fetchEdamam({
          search: { mealType: ['dinner'] },
          appId,
          appKey
        })
      } else {
        hits = await fetchEdamam({
          search: { q: 'yum' },
          appId,
          appKey
        })
      }
      // console.log('hits = ', hits);
      setEdamamRecipes(hits)
      setLoadingEdamam(false)

      setUpdateRecipes(true)
    } catch (e) {
      console.error(e)
      setLoadingEdamam(false)
    }
  }

  const getAppCredentials = async () => {
    const res = await client.query({ query: GET_APP_CREDENTIALS })
    if (!res) throw new Error('[handleRefresh] GET_APP_CREDENTIALS error')
    const appId = res.data.getApiKey.appId
    const appKey = res.data.getApiKey.appKey
    return { appId, appKey }
  }

  useEffect(() => {
    if (updateRecipes) {
      dispatch({ type: UPDATE_HOME_RECIPES, data: edamamRecipes })
      setUpdateRecipes(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateRecipes, edamamRecipes])

  // fetchEdamam on first load
  useEffect(() => {
    const fetchOnFirstLoad = async () => {
      if (state.homeDidMount === false) {
        dispatch({ type: FLAG_HOME_MOUNTED })
        try {
          setLoadingEdamam(true)
          const { appId, appKey } = await getAppCredentials()
          const hits = await fetchEdamam({ search: {}, appId, appKey })
          setEdamamRecipes(hits)
          setLoadingEdamam(false)
          setUpdateRecipes(true)
        } catch (e) {
          console.error(e)
        }
      }
    }
    fetchOnFirstLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.homeDidMount])

  return { loggedIn, firstName, loadingEdamam, edamamRecipes, handleRefresh }
}
