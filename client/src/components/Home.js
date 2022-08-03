import { useState, useEffect } from 'react';
import RecipeCardContainer from './RecipeCardContainer';
import search from '../utils/API';
import Content from './Content';
import ContentTitle from './ContentTitle';
import ContentSubtitle from './ContentSubtitle';

const Home = () => {
  const [results, setResults] = useState([]);
  const searchEdamam = async () => {
    const data = await search();
    setResults(data);
  };

  useEffect(() => {
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
