import RecipeCard from './RecipeCard';
function RecipeCardContainer(props) {
  return (
    <section className="recipe-card-container">
      {props.results.map((result) => (
        <RecipeCard key={result.label} className="list-group-item" result={result} />
      ))}
    </section>
  );
}

export default RecipeCardContainer;
