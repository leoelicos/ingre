import RecipeCardContainer from '../components/RecipeCardContainer';

import Content from '../components/Content';
import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

import { useStoreContext } from '../utils/GlobalState';

const Home = () => {
  const [state] = useStoreContext();
  return (
    <Content>
      <ContentTitle>Recipes, recipes, recipes</ContentTitle>
      <ContentSubtitle>Classic Italian favorites</ContentSubtitle>
      <RecipeCardContainer results={state.results} />
    </Content>
  );
};

export default Home;
