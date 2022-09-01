// React
import { useEffect, useState } from 'react';

// useContext
import { useStoreContext } from '../utils/state/GlobalState';
import { UPDATE_SAVED_RECIPES } from '../utils/state/actions';

// Ant components
import { Col, Row, Divider, Spin, Alert } from 'antd';

// Custom components
import Empty from '../components/Empty';
import RecipeCardContainer from '../components/RecipeCardContainer';
import ContentTitle from '../components/ContentTitle';

// Apollo
import { useQuery } from '@apollo/client';
import { GET_SAVED_RECIPES } from '../utils/apollo/queries.js';

// Auth
import Auth from '../utils/auth/index.js';

const Saved = () => {
  const { loading, error, data } = useQuery(GET_SAVED_RECIPES);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [, dispatch] = useStoreContext();

  useEffect(() => {
    document.title = 'ingré Search';
  }, []);

  useEffect(() => {
    if (!loading && !error && data) {
      setSavedRecipes(data.getSavedRecipes);
    }
  }, [loading, error, data]);

  useEffect(() => {
    dispatch({ type: UPDATE_SAVED_RECIPES, data: savedRecipes });
  }, [dispatch, savedRecipes]);

  if (loading) return <Divider>Loading</Divider>;
  if (error) return <Divider>Error</Divider>;
  return (
    <Col>
      <Row>
        <ContentTitle>Saved</ContentTitle>
      </Row>
      <Row>
        {Auth.loggedIn() ? (
          //
          <>
            {loading ? (
              //
              <Divider>
                <Spin tip="Loading saved recipes…"></Spin>
              </Divider>
            ) : error ? (
              //
              <Alert type="warning">Couldn't load saved recipes</Alert>
            ) : (
              <RecipeCardContainer results={savedRecipes} savePage={true} />
            )}
          </>
        ) : (
          <Empty>You need to be logged in to see saved recipes!</Empty>
        )}
      </Row>
    </Col>
  );
};

export default Saved;
