// React hooks
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Ant components
import { Button, Space, Row, Spin, Divider, Col } from 'antd';

// Custom components
import RecipeCardContainer from '../components/RecipeCardContainer';
import ContentTitle from '../components/ContentTitle';

// Edamam API
import FetchEdamam from '../utils/api/index.js';

// useContext
import { useStoreContext } from '../utils/state/GlobalState';

// useReducer
import { UPDATE_HOME_RECIPES, FLAG_HOME_MOUNTED } from '../utils/state/actions';

const Home = () => {
  const [state, dispatch] = useStoreContext();
  const [loadingEdamam, setLoadingEdamam] = useState(false);
  const [edamamRecipes, setEdamamRecipes] = useState(state.homeRecipes);

  const handleRefresh = async (query) => {
    console.log('Refresh clicked, fetchEdamam, setRecipes');
    try {
      setLoadingEdamam(true);
      let noQuery = { q: ' ', diet: [], health: [], cuisineType: [], mealType: [], dishType: [] };
      let hits;
      if (query === 'vegetarian') {
        hits = await FetchEdamam({ ...noQuery, health: ['vegetarian'] });
      } else if (query === 'vegan') {
        hits = await FetchEdamam({ ...noQuery, health: ['vegan'] });
      } else if (query === 'balanced') {
        hits = await FetchEdamam({ ...noQuery, diet: ['balanced'] });
      } else if (query === 'breakfast') {
        hits = await FetchEdamam({ ...noQuery, mealType: ['breakfast'] });
      } else if (query === 'lunch') {
        hits = await FetchEdamam({ ...noQuery, mealType: ['lunch'] });
      } else if (query === 'dinner') {
        hits = await FetchEdamam({ ...noQuery, mealType: ['dinner'] });
      } else {
        hits = await FetchEdamam();
      }
      console.log('hits = ', hits);
      setEdamamRecipes(hits);
      setLoadingEdamam(false);
      dispatch({ type: UPDATE_HOME_RECIPES, data: edamamRecipes });
    } catch (e) {
      console.error(e);
    }
  };

  // update homeRecipes on cleanup
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
          const hits = await FetchEdamam();
          // console.log('hits = ', hits);
          setEdamamRecipes(hits);
          setLoadingEdamam(false);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchOnFirstLoad();
  }, [dispatch, state, edamamRecipes]);

  // update title on every load
  useEffect(() => {
    document.title = 'ingré';
  }, []);

  return (
    <Col>
      <Row>
        <ContentTitle>Explore recipes</ContentTitle>
      </Row>

      <Row>
        <Space className="explore-buttons" wrap>
          <Button onClick={() => handleRefresh()}>Random</Button>
          <Button onClick={() => handleRefresh('vegetarian')}>Vegetarian</Button>
          <Button onClick={() => handleRefresh('vegan')}>Vegan</Button>
          <Button onClick={() => handleRefresh('balanced')}>Balanced</Button>
          <Button onClick={() => handleRefresh('breakfast')}>Breakfast</Button>
          <Button onClick={() => handleRefresh('lunch')}>Lunch</Button>
          <Button onClick={() => handleRefresh('dinner')}>Dinner</Button>
          <Button>
            <Link to="/search">Advanced Search</Link>
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
