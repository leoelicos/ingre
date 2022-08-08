// react
import { useState, useEffect } from 'react';

// components
import RecipeCardContainer from '../components/RecipeCardContainer';
import spinner from '../assets/spinner.gif';
import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

import { useMutation } from '@apollo/client';
import { ADD_RANDOM_RECIPES } from '../utils/apollo/mutations';
import { Button, Alert } from 'antd';
import { UPDATE_HOME_RECIPES } from '../utils/state/actions';

import { useStoreContext } from '../utils/state/GlobalState';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [state, dispatch] = useStoreContext();

  const [addRandomRecipes, { error }] = useMutation(ADD_RANDOM_RECIPES);

  const handleRefresh = async () => {
    try {
      const randomQueries = ['Delicious', 'Quick', 'Easy'];
      const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
      const payload = { variables: { input: { q: randomQuery } } };
      setLoading(true);
      const mutationResponse = await addRandomRecipes(payload);
      setLoading(false);
      if (error) console.log('error ', error);
      const data = mutationResponse.data.addRandomRecipes;

      dispatch({ type: UPDATE_HOME_RECIPES, data: data });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const call = () => {
      console.log('Call from useEffect');
      const randomQueries = ['Delicious', 'Quick', 'Easy'];
      const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
      const payload = { variables: { input: { q: randomQuery } } };
      setLoading(true);
      addRandomRecipes(payload).then((response) => {
        setLoading(false);
        const recipes = response.data.addRandomRecipes;
        dispatch({ type: UPDATE_HOME_RECIPES, data: recipes });
      });
    };
    call();
  }, [addRandomRecipes, dispatch]);

  useEffect(() => {
    document.title = 'ingré';
  }, []);

  return (
    <>
      <ContentTitle>Recipes, recipes, recipes</ContentTitle>
      <ContentSubtitle>
        Classic Italian favorites <Button onClick={handleRefresh}>Refresh</Button>
      </ContentSubtitle>
      {error ? (
        <RecipeCardContainer results={[]}>
          <Alert message="Error Text" type="error">
            Please check that you are signed in
          </Alert>
        </RecipeCardContainer>
      ) : (
        <> {loading ? <img src={spinner} alt="loading" /> : <RecipeCardContainer results={state.homeRecipes} loading={loading} />}</>
      )}
    </>
  );
};

export default Home;
