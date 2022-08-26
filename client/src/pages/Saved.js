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
  // const [state, dispatch] = useStoreContext();
  const { loading, error, data } = useQuery(GET_SAVED_RECIPES); //! trying to get this to work
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [, dispatch] = useStoreContext();

  useEffect(() => {
    document.title = 'ingré Search';
  }, []);

  useEffect(() => {
    setSavedRecipes(data.getSavedRecipes);
  }, [data]);

  const getRecipes = (data) => {
    console.log('Received data: ', data);
    const recipes = data.getSavedRecipes;
    console.log('Received recipes: ', recipes);
    return recipes;
  };

  return (
    <Col>
      <Row>
        <ContentTitle>Saved recipes</ContentTitle>
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
