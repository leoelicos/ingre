// react
import { useState, useEffect } from 'react';
// import {useState } from 'react';
// apollo
// import { useQuery } from '@apollo/client';
// import { QUERY_RECIPES } from '../utils/apollo/queries';

// components
import RecipeCardContainer from '../components/RecipeCardContainer';
import spinner from '../assets/spinner.gif';
import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

// import spinner from '../assets/spinner.gif';

import { useMutation } from '@apollo/client';
import { ADD_RANDOM_RECIPES } from '../utils/apollo/mutations';
import { Button, Alert } from 'antd';
import { UPDATE_HOME_RECIPES } from '../utils/state/actions';

import { useStoreContext } from '../utils/state/GlobalState';

const Home = () => {
  const [loading, setLoading] = useState();
  const [state, dispatch] = useStoreContext();
  // const [recipes, setRecipes] = useState();
  const [addRandomRecipes, { error }] = useMutation(ADD_RANDOM_RECIPES);
  // const { loading, data } = useQuery(QUERY_RECIPES);
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
      // setRecipes(data)
      dispatch({ type: UPDATE_HOME_RECIPES, data: data });
      // setRecipeState(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const call = () => {
      const randomQueries = ['Delicious', 'Quick', 'Easy'];
      const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
      const payload = { variables: { input: { q: randomQuery } } };
      addRandomRecipes(payload).then((response) => {
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
        <> {loading ? <img src={spinner} alt="loading" /> : <RecipeCardContainer results={state.homeRecipes} />}</>
      )}
    </>
  );
};

export default Home;
