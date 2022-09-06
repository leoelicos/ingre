// React
import { useEffect, useState } from 'react';

// useContext
import { useStoreContext } from '../../utils/state/GlobalState';
import { UPDATE_SAVED_RECIPES } from '../../utils/state/actions';

// Ant components
import { Col, Row, Divider, Spin, Button } from 'antd';

// Custom components
import Empty from '../../components/Empty';
import RecipeCardContainer from '../../components/RecipeCardContainer';
import ContentTitle from '../../components/ContentTitle';
import Alert from '../../components/Alert';

// Apollo
import { useLazyQuery } from '@apollo/client';
import { GET_SAVED_RECIPES } from '../../utils/apollo/queries.js';

// Auth
import Auth from '../../utils/auth/index.js';
import { Link } from 'react-router-dom';

const Saved = () => {
  const [getSavedRecipes, { loading, error, data }] = useLazyQuery(GET_SAVED_RECIPES);
  const [savedRecipes, setSavedRecipes] = useState(null);
  const [, dispatch] = useStoreContext();
  const [updateRecipes, setUpdateRecipes] = useState(false);

  // Store results in global state
  useEffect(() => {
    if (Auth.loggedIn() && updateRecipes && savedRecipes) {
      dispatch({ type: UPDATE_SAVED_RECIPES, data: savedRecipes });
      setUpdateRecipes(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateRecipes, savedRecipes]);

  useEffect(() => {
    if (Auth.loggedIn() && !loading && !error && data?.getSavedRecipes) {
      setSavedRecipes(data.getSavedRecipes);
      setUpdateRecipes(true);
    }
  }, [loading, error, data]);

  useEffect(() => {
    document.title = 'ingré Search';
    const triggerGetSavedRecipes = async () => {
      await getSavedRecipes();
      setUpdateRecipes(true);
    };
    if (Auth.loggedIn()) triggerGetSavedRecipes();
  }, [getSavedRecipes]);

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
              <Divider>
                <Spin tip="Loading saved recipes…"></Spin>
              </Divider>
            ) : error ? (
              <Alert
                type="error"
                message="Couldn't load saved recipes"
                //
              />
            ) : (
              <RecipeCardContainer results={savedRecipes} savePage={true} />
            )}
          </>
        ) : (
          <Empty>
            <Divider />
            <Row>You need to be logged in to see this page.</Row>
            <Link to="/login">
              <Button type="primary" style={{ marginTop: '1rem' }}>
                Log in
              </Button>
            </Link>
          </Empty>
        )}
      </Row>
    </Col>
  );
};

export default Saved;
