import RecipeCard from './RecipeCard';
import Empty from './Empty';
import { v4 as uuidv4 } from 'uuid';
const App = ({ results, loading }) => {
  // console.log('[RecipeCardContainer] results ', results);

  return (
    <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'space-evenly' }}>
      {results.length ? (
        results.map((recipe) => {
          return <RecipeCard key={uuidv4()} name={recipe.name} picture_url={recipe.picture_url} recipe={recipe} loading={loading} />;
        })
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default App;
