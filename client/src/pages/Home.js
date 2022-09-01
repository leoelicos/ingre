// React hooks
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Ant components
import { Button, Space, Row, Spin, Divider, Col } from 'antd';

// Custom components
import RecipeCardContainer from '../components/RecipeCardContainer';

// Edamam API
import FetchEdamam from '../utils/api/index.js';

// useContext
import { useStoreContext } from '../utils/state/GlobalState';

// useReducer
import { UPDATE_HOME_RECIPES, FLAG_HOME_MOUNTED } from '../utils/state/actions';

// get API key
import { GET_API_KEY } from '../utils/apollo/queries';
import { useApolloClient } from '@apollo/client';

const Home = () => {
  const client = useApolloClient();

  const [state, dispatch] = useStoreContext();
  const [loadingEdamam, setLoadingEdamam] = useState(false);
  const [edamamRecipes, setEdamamRecipes] = useState(state.homeRecipes);

  const getAppCredentials = async () => {
    // get credentials from backend
    const res = await client.query({ query: GET_API_KEY });
    if (!res) throw new Error('[handleRefresh] GET_API_KEY error');
    const appId = res.data.getApiKey.appId;
    const appKey = res.data.getApiKey.appKey;
    return { appId, appKey };
  };

  const handleRefresh = async (query) => {
    try {
      // get credentials from backend
      const { appId, appKey } = await getAppCredentials();

      setLoadingEdamam(true);
      let noQuery = { q: ' ', diet: [], health: [], cuisineType: [], mealType: [], dishType: [] };
      let hits;
      if (query === 'vegetarian') {
        hits = await FetchEdamam({ ...noQuery, health: ['vegetarian'] }, appId, appKey);
      } else if (query === 'vegan') {
        hits = await FetchEdamam({ ...noQuery, health: ['vegan'] }, appId, appKey);
      } else if (query === 'balanced') {
        hits = await FetchEdamam({ ...noQuery, diet: ['balanced'] }, appId, appKey);
      } else if (query === 'breakfast') {
        hits = await FetchEdamam({ ...noQuery, mealType: ['breakfast'] }, appId, appKey);
      } else if (query === 'lunch') {
        hits = await FetchEdamam({ ...noQuery, mealType: ['lunch'] }, appId, appKey);
      } else if (query === 'dinner') {
        hits = await FetchEdamam({ ...noQuery, mealType: ['dinner'] }, appId, appKey);
      } else {
        hits = await FetchEdamam(null, appId, appKey);
      }
      // console.log('hits = ', hits);
      setEdamamRecipes(hits);
      setLoadingEdamam(false);
      dispatch({ type: UPDATE_HOME_RECIPES, data: edamamRecipes });
    } catch (e) {
      console.error(e);
    }
  };

  //* edamamRecipes > GlobalState.homeRecipes
  useEffect(() => {
    return () => {
      dispatch({ type: UPDATE_HOME_RECIPES, data: edamamRecipes });
    };
  }, [dispatch, edamamRecipes]);

  // fetchEdamam on first load
  useEffect(() => {
    const fetchOnFirstLoad = async () => {
      if (state.homeDidMount === false) {
        // console.log('home did mount');
        dispatch({ type: FLAG_HOME_MOUNTED });
        // populate with random recipes
        try {
          setLoadingEdamam(true);
          // get credentials from backend
          const { appId, appKey } = await getAppCredentials();
          const hits = await FetchEdamam(null, appId, appKey);
          // console.log('hits = ', hits);
          setEdamamRecipes(hits);
          setLoadingEdamam(false);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchOnFirstLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state, edamamRecipes]);

  // update title on every load
  useEffect(() => {
    document.title = 'ingré';
  }, []);

  return (
    <Col>
      <Row>
        <Space className="explore-buttons" wrap>
          <Button onClick={() => handleRefresh()}>Random</Button>
          <Button onClick={() => handleRefresh('vegetarian')}>Vegetarian</Button>
          <Button onClick={() => handleRefresh('vegan')}>Vegan</Button>
          <Button onClick={() => handleRefresh('balanced')}>Balanced</Button>
          <Button onClick={() => handleRefresh('breakfast')}>Breakfast</Button>
          <Button onClick={() => handleRefresh('lunch')}>Lunch</Button>
          <Button onClick={() => handleRefresh('dinner')}>Dinner</Button>
          <Button type="ghost">
            <Link to="/search">Search</Link>
          </Button>
        </Space>
      </Row>
      {loadingEdamam ? (
        <Divider>
          <Spin tip="Loading…"></Spin>
        </Divider>
      ) : (
        <RecipeCardContainer results={edamamRecipes} loading={loadingEdamam} />
        //
      )}
    </Col>
  );
};

export default Home;
