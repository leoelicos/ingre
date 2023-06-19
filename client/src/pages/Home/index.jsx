// React hooks
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
// Ant components
import { Button, Space, Row, Spin, Divider, Col } from 'antd'

// Custom components
import RecipeCardContainer from '../../components/RecipeCardContainer'

// Edamam API
import fetchEdamam from '../../utils/api/index.ts'

// useContext
import { useStoreContext } from '../../utils/state/GlobalState'

// useReducer
import {
  UPDATE_HOME_RECIPES,
  FLAG_HOME_MOUNTED
} from '../../utils/state/actions'

// get API key
import { GET_API_KEY } from '../../utils/apollo/queries'
import { useApolloClient } from '@apollo/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Auth
import Auth from '../../utils/auth'
import ContentTitle from '../../components/ContentTitle'

const Home = () => {
  const client = useApolloClient()

  const [state, dispatch] = useStoreContext()
  const [loadingEdamam, setLoadingEdamam] = useState(false)
  const [edamamRecipes, setEdamamRecipes] = useState(state.homeRecipes)
  const [updateRecipes, setUpdateRecipes] = useState(false)

  const getAppCredentials = async () => {
    // get credentials from backend
    const res = await client.query({ query: GET_API_KEY })
    if (!res) throw new Error('[handleRefresh] GET_API_KEY error')
    const appId = res.data.getApiKey.appId
    const appKey = res.data.getApiKey.appKey
    return { appId, appKey }
  }

  const handleRefresh = async (query) => {
    try {
      // get credentials from backend
      const { appId, appKey } = await getAppCredentials()

      setLoadingEdamam(true)

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
          search,
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
    }
  }

  // Store results in global state
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
        // console.log('home did mount');
        dispatch({ type: FLAG_HOME_MOUNTED })
        // populate with random recipes
        try {
          setLoadingEdamam(true)
          // get credentials from backend
          const { appId, appKey } = await getAppCredentials()
          const search = {}
          const hits = await fetchEdamam({ search, appId, appKey })
          // console.log('hits = ', hits);
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

  // update title on every load
  useEffect(() => {
    document.title = 'ingré'
  }, [])

  return (
    <Col>
      {Auth.loggedIn() && (
        <Row>
          <ContentTitle>
            <Space>Welcome {Auth.getProfile()?.data?.firstName}</Space>
          </ContentTitle>
        </Row>
      )}
      <Row>
        <Space
          className="explore-buttons"
          wrap
        >
          <Button onClick={() => handleRefresh()}>Random</Button>
          <Button onClick={() => handleRefresh('vegetarian')}>
            Vegetarian
          </Button>
          <Button onClick={() => handleRefresh('vegan')}>Vegan</Button>
          <Button onClick={() => handleRefresh('balanced')}>Balanced</Button>
          <Button onClick={() => handleRefresh('breakfast')}>Breakfast</Button>
          <Button onClick={() => handleRefresh('lunch')}>Lunch</Button>
          <Button onClick={() => handleRefresh('dinner')}>Dinner</Button>
          <Button type="primary">
            <Link to="/search">
              <Space>
                <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
                Search
              </Space>
            </Link>
          </Button>
        </Space>
      </Row>
      {loadingEdamam ? (
        <Divider>
          <Spin tip="Loading…"></Spin>
        </Divider>
      ) : (
        <RecipeCardContainer
          results={edamamRecipes}
          loading={loadingEdamam}
          onSavedPage={false}
        />
        //
      )}
    </Col>
  )
}

export default Home
