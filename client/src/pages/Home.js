// React hooks
import { useState, useEffect } from 'react';

// Components
import { Button, Divider } from 'antd';
import RecipeCardContainer from '../components/RecipeCardContainer';
import spinner from '../assets/spinner.gif';
import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

// Auth
import Auth from '../utils/auth.js';

// Edamam API
import FetchEdamam from '../utils/api/index.js';

import { useStoreContext } from '../utils/state/GlobalState';
import { UPDATE_HOME_RECIPES, FLAG_HOME_MOUNTED } from '../utils/state/actions';

const Home = () => {
  const [state, dispatch] = useStoreContext();
  const [loadingEdamam, setLoadingEdamam] = useState(false);
  const [edamamRecipes, setEdamamRecipes] = useState(state.homeRecipes);

  const handleRefresh = async () => {
    console.log('Refresh clicked, fetchEdamam, setRecipes');
    try {
      setLoadingEdamam(true);
      const hits = await FetchEdamam();
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
    <>
      <ContentTitle>Recipes, recipes, recipes</ContentTitle>
      <ContentSubtitle>
        Classic Italian favorites <Button onClick={handleRefresh}>Refresh</Button>
      </ContentSubtitle>
      {!Auth.loggedIn() && <Divider>Log in to edit and save recipes!</Divider>}
      {loadingEdamam ? (
        //
        <img src={spinner} alt="loading" />
      ) : (
        <RecipeCardContainer results={edamamRecipes} loading={loadingEdamam} />
      )}
    </>
  );
};

export default Home;
