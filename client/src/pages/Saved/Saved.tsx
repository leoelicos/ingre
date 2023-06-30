/* react */
import React, { FC, useEffect } from 'react'

/* state */
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import {
  FLAG_SAVED_MOUNTED,
  UPDATE_SAVED_RECIPES
} from '../../utils/state/actions.ts'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

/* components */
import { Col, Row, Divider, Spin, Alert } from 'antd'
import RecipeCardContainer from '../../components/Recipe/RecipeCardContainer.tsx'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import NotLoggedIn from '../../components/Authentication/NotLoggedIn.tsx'

/* data */
import { useLazyQuery } from '@apollo/client'
import { GET_SAVED_RECIPES } from '../../utils/apollo/queries.ts'

/* hooks */
import { changeTitle } from '../../utils/changeTitle.ts'

const Saved: FC = () => {
  changeTitle('Search')
  const [authState] = useAuthContext()
  const loggedIn = authState.loggedIn
  if (!loggedIn) return <NotLoggedIn />

  const [, { loading, error, data, refetch }] = useLazyQuery(GET_SAVED_RECIPES)
  const [state, dispatch] = useStoreContext()

  // update local savedRecipes when getSavedRecipes is loaded from server
  useEffect(() => {
    if (!loading && !error && data?.getSavedRecipes) {
      dispatch({ type: UPDATE_SAVED_RECIPES, data: data.getSavedRecipes })
    }
  }, [loading, error, data, dispatch])

  // run on first load
  useEffect(() => {
    const fetchOnFirstLoad = async () => {
      if (state.savedDidMount === false) {
        dispatch({ type: FLAG_SAVED_MOUNTED })
        await refetch()
      }
    }
    fetchOnFirstLoad()
  }, [state.savedDidMount, refetch, dispatch])

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
