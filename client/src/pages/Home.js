import { useState, useEffect } from 'react';
import RecipeCardContainer from '../components/RecipeCardContainer';
import search from '../utils/API';
import Content from '../components/Content';
import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

const Home = () => {
  const [results, setResults] = useState([]);
  const searchEdamam = async () => {
    const data = await search();
    setResults(data);
  };

  useEffect(() => {
    console.log('call this');
    searchEdamam();
  }, []);

  return (
    <Content>
      <ContentTitle>Recipes, recipes, recipes</ContentTitle>
      <ContentSubtitle>Classic Italian favorites</ContentSubtitle>
      <RecipeCardContainer results={results} />
    </Content>
  );
};

export default Home;
