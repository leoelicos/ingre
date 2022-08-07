import RecipeCard from './RecipeCard';
import Empty from './Empty';

const App = ({ results, children }) => {
  // console.log('results = ', results);

  return (
    <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'space-evenly' }}>
      {results.length ? (
        results.map((recipe) => {
          return <RecipeCard key={recipe._id} name={recipe.name} picture_url={recipe.picture_url} recipe={recipe} />;
        })
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default App;
