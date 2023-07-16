/* react */
import React, { FC, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/* components */
import { Button, Space, Row, Spin, Divider, Col } from 'antd'
import RecipeCardContainer from '../../components/RecipeCardContainer/RecipeCardContainer.tsx'
import ContentTitle from '../../components/Text/ContentTitle.tsx'

/* state */
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import {
  UPDATE_HOME_RECIPES,
  FLAG_HOME_MOUNTED
} from '../../utils/state/actions.ts'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

/* data */
import { useApolloClient } from '@apollo/client'
import { GET_APP_CREDENTIALS } from '../../lib/apollo/graphQL/queries.ts'
import fetchEdamam from '../../utils/api/edamam.ts'

/* hooks */
import { changeTitle } from '../../utils/changeTitle.ts'
import { IngreIconSearch } from '../../lib/icon/Icon.tsx'

const Home: FC = () => {
  changeTitle('Recipes')

  const [authState] = useAuthContext()
  const loggedIn = authState.loggedIn
  const firstName = authState.profile?.data.firstName || 'chef'

  const client = useApolloClient()

  const [state, dispatch] = useStoreContext()
  const [loadingEdamam, setLoadingEdamam] = useState(false)
  const [edamamRecipes, setEdamamRecipes] = useState(state.homeRecipes)
  const [updateRecipes, setUpdateRecipes] = useState(false)

  const getAppCredentials = async () => {
    // get credentials from backend
    const res = await client.query({ query: GET_APP_CREDENTIALS })
    if (!res) throw new Error('[handleRefresh] GET_APP_CREDENTIALS error')
    const appId = res.data.getApiKey.appId
    const appKey = res.data.getApiKey.appKey
    return { appId, appKey }
  }

  const handleRefresh = async (query: string) => {
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

  return (
    <Col>
      {loggedIn && (
        <Row>
          <ContentTitle>
            <Space>Welcome {firstName}</Space>
          </ContentTitle>
        </Row>
      )}
      <Row>
        <Space
          className="explore-buttons"
          wrap
        >
          <Button onClick={() => handleRefresh('yum')}>Random</Button>
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
                <IngreIconSearch />
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
