// React
import { useEffect, useState } from 'react'

// useContext
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import {
  FLAG_SAVED_MOUNTED,
  UPDATE_SAVED_RECIPES
} from '../../utils/state/actions.ts'

// Ant
import { Col, Row, Divider, Spin, Button, Alert, Empty } from 'antd'

// Custom components

import RecipeCardContainer from '../../components/RecipeCardContainer'
import ContentTitle from '../../components/ContentTitle'

// Apollo
import { useLazyQuery } from '@apollo/client'
import { GET_SAVED_RECIPES } from '../../utils/apollo/queries.ts'

// Auth
import Auth from '../../utils/auth/index.ts'
import { Link } from 'react-router-dom'
import NotLoggedIn from '../../components/NotLoggedIn.tsx'

const Saved = () => {
  const [, { loading, error, data, refetch }] = useLazyQuery(GET_SAVED_RECIPES)
  const [state, dispatch] = useStoreContext()

  // update local savedRecipes when getSavedRecipes is loaded from server
  useEffect(() => {
    if (Auth.loggedIn() && !loading && !error && data?.getSavedRecipes) {
      dispatch({ type: UPDATE_SAVED_RECIPES, data: data.getSavedRecipes })
    }
  }, [loading, error, data, dispatch])

  // run on first load
  useEffect(() => {
    if (!Auth.loggedIn()) return
    const fetchOnFirstLoad = async () => {
      if (state.savedDidMount === false) {
        dispatch({ type: FLAG_SAVED_MOUNTED })
        await refetch()
      }
    }
    fetchOnFirstLoad()
  }, [state.savedDidMount, refetch, dispatch])

  // update title on every load
  useEffect(() => {
    document.title = 'Search'
  }, [])

  if (!Auth.loggedIn) return <NotLoggedIn />

  if (loading) return <SaveLoading />

  if (error) return <SaveError />

  return (
    <Col>
      <Row>
        <ContentTitle>Saved</ContentTitle>
      </Row>
      <Row>
        <RecipeCardContainer
          results={state.savedRecipes}
          onSavedPage={true}
          loading={loading}
        />
      </Row>
    </Col>
  )
}

export default Saved

const SaveLoading = () => (
  <Col>
    <Row>
      <ContentTitle>Saved</ContentTitle>
    </Row>
    <Row>
      <Divider>
        <Spin tip="Loading saved recipes…"></Spin>
      </Divider>
    </Row>
  </Col>
)

const SaveError = () => (
  <Col>
    <Row>
      <ContentTitle>Saved</ContentTitle>
    </Row>
    <Row>
      <Alert
        type="error"
        message="Couldn't load saved recipes"
      />
    </Row>
  </Col>
)
