// We import useState and useEffect in our component
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import RecipeCard from '../components/RecipeCard';

function App() {
  // We declare a state variable that is an array called `issues` and a function to update it.
  const [recipes, setRecipes] = useState([]);

  // When the page loads, set the document title to something specific to this app. Runs once because of optional dependency array
  useEffect(() => {
    document.title = 'React Hooks Review';
  }, []);

  // Helper function that preforms an API request and sets the `recipes` array to a list of recipes from GitHub
  const getRecipes = async (query) => {
    let recipesURL = `https://api.edamam.com/api/recipes/v2?type=public&beta=false&q=${query}/&app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0`;
    const response = await fetch(recipesURL);
    const data = await response.json();
    setRecipes(
      data.data.hits.map(({ recipe }) => ({
        label: recipe.label,
        yield: recipe.yield,
        image: recipe.image,
        ingredients: recipe.ingredients.map((ingredient) => ({
          name: ingredient.food,
          category: ingredient.foodCategory,
          quantity: ingredient.quantity,
          measure: ingredient.measure,
          text: ingredient.text
        }))
      }))
    );
  };

  return (
    <div>
      {/* Here we pass our getRecipes function as a prop to SearchBar */}
      <SearchBar onFormSubmit={getRecipes} />
      <div>
        <div>
          <div>
            <RecipeCard recipes={recipes} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
