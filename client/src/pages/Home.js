// react
import { QUERY_RECIPES } from '../utils/apollo/queries';

// apollo
import { useQuery } from '@apollo/client';

// components
import RecipeCardContainer from '../components/RecipeCardContainer';

import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

import spinner from '../assets/spinner.gif';

// import { useStoreContext } from '../utils/state/GlobalState';

const Home = () => {
  const { loading, data } = useQuery(QUERY_RECIPES);

  return (
    <>
      <ContentTitle>Recipes, recipes, recipes</ContentTitle>
      <ContentSubtitle>Classic Italian favorites</ContentSubtitle>

      {loading ? <img src={spinner} alt="loading" /> : <RecipeCardContainer results={data} />}
    </>
  );
};

export default Home;
