import RecipeCard from './RecipeCard';

const App = (props) => {
  const recipes = props.results.getRecipes;

  // for (const recipe of recipes) console.log(`Recipe name = ${recipe._id}`);

  return (
    <div style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'space-evenly' }}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id.toString()} name={recipe.name} picture_url={recipe.picture_url} />
      ))}
    </div>
  );
};

export default App;
