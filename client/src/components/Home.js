import { useState, useEffect } from 'react';
import RecipeCardContainer from './RecipeCardContainer';
import search from '../utils/API';

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
    <div>
      <RecipeCardContainer results={results} />
    </div>
  );
};

export default Home;
