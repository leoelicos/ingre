// We import useState and useEffect in our component
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import RecipeCardContainer from '../components/RecipeCardContainer';

function App() {
  // We declare a state variable that is an array called `issues` and a function to update it.
  const [recipes, setRecipes] = useState([]);

  // When the page loads, set the document title to something specific to this app. Runs once because of optional dependency array
  useEffect(() => {
    document.title = 'Search';
  }, []);

  // Helper function that preforms an API request and sets the `recipes` array to a list of recipes from GitHub
  /*   const getRecipes = async (query) => {
    let recipesURL = `https://api.edamam.com/api/recipes/v2?type=public&beta=false&q=${query}&app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0`;
    const response = await fetch(recipesURL);
    console.log('API was called');
    const data = await response.json();
    console.log('the data is ', data);
    const results = await data.hits.map(({ recipe }) => ({
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
    }));
    await console.log('the cleaned data is ', results);
    await setRecipes(results);
  }; */
  const getRecipes = async () => {
    setRecipes(dummyData);
    return dummyData;
  };

  return (
    <div>
      {/* Here we pass our getRecipes function as a prop to SearchBar */}
      <SearchBar onFormSubmit={() => getRecipes()} />
      <RecipeCardContainer results={recipes} />
    </div>
  );
}

export default App;

var dummyData = [
  {
    label: 'Basic Homemade Harissa Recipe',
    yield: 8,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/ec7/ec79b729965ccc98460853d19baf64fa.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=887f10e47a3c53636a244a88749dbd803aa9d47921854d6a2eff38f39a95f6ab',
    ingredients: [
      {
        name: 'caraway seeds',
        category: 'Condiments and sauces',
        quantity: 2.5,
        measure: 'teaspoon',
        text: '2 1/2 teaspoons caraway seeds, undefined'
      },
      {
        name: 'coriander seeds',
        category: 'Condiments and sauces',
        quantity: 2.5,
        measure: 'teaspoon',
        text: '2 1/2 teaspoons coriander seeds'
      },
      {
        name: 'cumin seeds',
        category: 'Condiments and sauces',
        quantity: 2.5,
        measure: 'teaspoon',
        text: '2 1/2 teaspoons cumin seeds'
      },
      {
        name: 'red chilies',
        category: 'vegetables',
        quantity: 5,
        measure: '<unit>',
        text: '5 fresh red chilies, halved and seeded'
      },
      {
        name: 'chilies',
        category: 'vegetables',
        quantity: 5,
        measure: '<unit>',
        text: '5 dried guajillo chilies, soaked in warm water, drained and seeded (reserve the liquid)'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 8,
        measure: 'clove',
        text: '8 garlic cloves'
      },
      {
        name: 'cilantro',
        category: 'vegetables',
        quantity: 1,
        measure: 'leaf',
        text: 'leaves from a small bunch of cilantro'
      },
      {
        name: 'lemon',
        category: 'fruit',
        quantity: 1,
        measure: '<unit>',
        text: 'juice of one lemon'
      },
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 1.25,
        measure: 'cup',
        text: '1 1/4 cups olive oil, plus more for storing'
      },
      {
        name: 'salt',
        category: 'Condiments and sauces',
        quantity: 0.75,
        measure: 'teaspoon',
        text: '3/4 teaspoon salt, or to taste'
      }
    ]
  },
  {
    label: 'Cider Cookies',
    yield: 12,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/ed3/ed3c92ce3ac399f8a3007c5eaab8ac6b.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=47afe658c888faa4488f01bbbea7b7b8f34c3849b23b597455f18383a8fe7330',
    ingredients: [
      {
        name: 'flour',
        category: 'grains',
        quantity: 2,
        measure: 'cup',
        text: '2 cups flour'
      },
      {
        name: 'baking soda',
        category: 'condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon baking soda'
      },
      {
        name: 'cinnamon',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon cinnamon'
      },
      {
        name: 'salt',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 teaspoon salt'
      },
      {
        name: 'cloves',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 teaspoon cloves'
      },
      {
        name: 'nutmeg',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 teaspoon nutmeg'
      },
      {
        name: 'brown sugar',
        category: 'sugars',
        quantity: 1.3333333333333333,
        measure: 'cup',
        text: '1 1/3 cup brown sugar'
      },
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 0.75,
        measure: 'cup',
        text: '3/4 cup butter, softened'
      },
      {
        name: 'egg',
        category: 'Eggs',
        quantity: 1,
        measure: '<unit>',
        text: '1 large egg'
      },
      {
        name: 'pecans',
        category: 'plant-based protein',
        quantity: 0.25,
        measure: 'cup',
        text: '1/4 cup pecans, finely ground'
      },
      {
        name: 'apple',
        category: 'fruit',
        quantity: 1,
        measure: 'cup',
        text: '1 cup grated apple (honeycrisp, large grate)'
      },
      {
        name: 'apple cider',
        category: 'fruit',
        quantity: 0.25,
        measure: 'cup',
        text: '1/4 cup apple cider'
      }
    ]
  },
  {
    label: 'Cheesy Sloppy Joes',
    yield: 12,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/b7c/b7c5efd59e548df9fd3fc8895937728c.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2cfcb201c3c1ccaaa972cede14782d3b4cc4fe20f2fdf3f3b8c9522a53b80ac0',
    ingredients: [
      {
        name: 'canola oil',
        category: 'Oils',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 Tablespoon canola oil'
      },
      {
        name: 'Spanish onion',
        category: 'vegetables',
        quantity: 1,
        measure: 'cup',
        text: '1 Cup Spanish onion, chopped'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 4,
        measure: 'clove',
        text: '4 cloves garlic, finely chopped'
      },
      {
        name: 'jalapeño',
        category: 'vegetables',
        quantity: 1,
        measure: '<unit>',
        text: '1 small jalapeño (or serrano chile), finely chopped'
      },
      {
        name: 'ground beef',
        category: 'meats',
        quantity: 1,
        measure: 'pound',
        text: '1 Pound ground beef'
      },
      {
        name: 'ground pork',
        category: 'meats',
        quantity: 8,
        measure: 'ounce',
        text: '8 Ounces ground pork'
      },
      {
        name: 'crushed tomatoes',
        category: 'canned vegetables',
        quantity: 1,
        measure: 'cup',
        text: '1 Cup canned, crushed tomatoes'
      },
      {
        name: 'tomato paste',
        category: 'canned vegetables',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 Tablespoons tomato paste'
      },
      {
        name: 'Chipotle',
        category: 'canned vegetables',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 Tablespoons Cholula Chipotle'
      },
      {
        name: 'liquid smoke',
        category: 'water',
        quantity: 2,
        measure: 'teaspoon',
        text: '2 Teaspoons liquid smoke'
      },
      {
        name: 'jack cheese',
        category: 'Cheese',
        quantity: 4,
        measure: 'slice',
        text: '4 slices pepper jack cheese'
      },
      {
        name: 'hamburger buns',
        category: 'bread, rolls and tortillas',
        quantity: 4,
        measure: '<unit>',
        text: '4 large hamburger buns'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper to taste'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper to taste'
      }
    ]
  },
  {
    label: 'Long Johns (Old Fashioned Soft Molasses Cookies)',
    yield: 18,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/4a4/4a4560a34e5ae8db39f4c55445775e3e.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d975ed57e1dbfd584630c6e888a8eb7252e015866c38b8b2eeef45c8c4c2ff00',
    ingredients: [
      {
        name: 'shortening',
        category: 'Oils',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup shortening'
      },
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup butter'
      },
      {
        name: 'white sugar',
        category: 'sugars',
        quantity: 1,
        measure: 'cup',
        text: '1 cup white sugar'
      },
      {
        name: 'cream of tartar',
        category: 'condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon cream of tartar'
      },
      {
        name: 'molasses',
        category: null,
        quantity: 1,
        measure: 'cup',
        text: '1 cup molasses'
      },
      {
        name: 'egg',
        category: 'Eggs',
        quantity: 1,
        measure: '<unit>',
        text: '1 egg'
      },
      {
        name: 'baking soda',
        category: 'condiments and sauces',
        quantity: 3,
        measure: 'teaspoon',
        text: '3 teaspoons baking soda'
      },
      {
        name: 'water',
        category: 'water',
        quantity: 0.75,
        measure: 'cup',
        text: '3/4 cup boiling water'
      },
      {
        name: 'vanilla',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon vanilla'
      },
      {
        name: 'all-purpose flour',
        category: 'grains',
        quantity: 5.5,
        measure: 'cup',
        text: '5 1/2 cups all-purpose flour'
      },
      {
        name: 'salt',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon salt'
      },
      {
        name: 'cinnamon',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'teaspoon',
        text: '1/2 teaspoon cinnamon'
      },
      {
        name: 'ginger',
        category: 'vegetables',
        quantity: 0.5,
        measure: 'teaspoon',
        text: '1/2 teaspoon ginger'
      },
      {
        name: 'cloves',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'teaspoon',
        text: '1/2 teaspoon cloves'
      }
    ]
  },
  {
    label: "The Nasty Bits: Pig's Head Recipe",
    yield: 54,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/080/080b24a7a200fe7c0f40d768085efc1c.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=9de4dde403e2a2f207e67e895657253f18fe24373dac06bf8eaca7c01dc7fb7d',
    ingredients: [
      {
        name: 'pig',
        category: 'meats',
        quantity: 1,
        measure: '<unit>',
        text: "1 pig's head"
      },
      {
        name: 'bouquet garni',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: '<unit>',
        text: '1 bouquet garni, or 1 large section of ginger'
      },
      {
        name: 'cooking wine',
        category: 'condiments and sauces',
        quantity: 1,
        measure: 'cup',
        text: '1 cup sake or cooking wine'
      },
      {
        name: 'black peppercorns',
        category: 'Condiments and sauces',
        quantity: 12,
        measure: '<unit>',
        text: 'A dozen black peppercorns'
      },
      {
        name: 'salt',
        category: 'Condiments and sauces',
        quantity: 3,
        measure: 'tablespoon',
        text: '3 tablespoons salt, plus more to taste'
      },
      {
        name: 'sherry vinegar',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'cup',
        text: 'Juice of 1/2 lemon, or 1/4 cup rice or sherry vinegar'
      },
      {
        name: 'salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'More salt and pepper to taste'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'More salt and pepper to taste'
      }
    ]
  },
  {
    label: 'Buffalo Joes with Blue Cheese and Carrot-Celery Slaw Relish',
    yield: 16,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/8fb/8fb6a478d40dcf5ff9365bb5e4e64161.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=36307b440debc758c38c1fffdd3d6bf640f7d81367113da6f731b0285167917f',
    ingredients: [
      {
        name: 'cider vinegar',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup cider vinegar'
      },
      {
        name: 'vegetable oil',
        category: 'Oils',
        quantity: 3,
        measure: 'tablespoon',
        text: '3 tablespoons vegetable oil'
      },
      {
        name: 'sugar',
        category: 'sugars',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons super fine sugar'
      },
      {
        name: 'cabbage',
        category: 'vegetables',
        quantity: 1,
        measure: 'cup',
        text: '1 cup chopped cabbage'
      },
      {
        name: 'carrots',
        category: 'vegetables',
        quantity: 2,
        measure: '<unit>',
        text: '2 carrots, shredded'
      },
      {
        name: 'celery',
        category: 'vegetables',
        quantity: 2.5,
        measure: 'rib',
        text: '2 to 3 ribs celery, finely chopped'
      },
      {
        name: 'celery seed',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon celery seed'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon olive oil'
      },
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons butter'
      },
      {
        name: 'ground turkey',
        category: 'Poultry',
        quantity: 2,
        measure: 'pound',
        text: '2 pounds ground turkey or chicken'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'onion',
        category: 'vegetables',
        quantity: 1,
        measure: '<unit>',
        text: '1 onion, chopped'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 4,
        measure: 'clove',
        text: '4 cloves garlic, chopped'
      },
      {
        name: 'chili peppers',
        category: 'vegetables',
        quantity: 2,
        measure: '<unit>',
        text: '2 Red Fresno or Holland chili peppers, seeded and chopped'
      },
      {
        name: 'ground allspice',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon (about 1/3 palmful) ground allspice'
      },
      {
        name: 'tomato sauce',
        category: 'canned vegetables',
        quantity: 1,
        measure: 'cup',
        text: '1 cup tomato sauce'
      },
      {
        name: 'chicken stock',
        category: 'canned soup',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup turkey or chicken stock'
      },
      {
        name: 'Hot sauce',
        category: 'canned soup',
        quantity: 0.3333333333333333,
        measure: 'cup',
        text: '1/3 cup Frank’s Red Hot sauce'
      },
      {
        name: 'light brown sugar',
        category: 'sugars',
        quantity: 3,
        measure: 'tablespoon',
        text: '3 tablespoons (packed) light brown sugar'
      },
      {
        name: 'Worcestershire sauce',
        category: 'canned soup',
        quantity: 3,
        measure: 'tablespoon',
        text: '3 tablespoons Worcestershire sauce'
      },
      {
        name: 'burger rolls',
        category: 'bread, rolls and tortillas',
        quantity: 7,
        measure: '<unit>',
        text: '6 to 8 burger rolls, split'
      },
      {
        name: 'blue cheese',
        category: 'Cheese',
        quantity: 2,
        measure: 'cup',
        text: '2 cups crumbled smoked blue cheese (get my favorite at http://www.oscarsadksmokehouse.com/) or regular blue cheese crumbles'
      }
    ]
  },
  {
    label: 'Bacon-Jalapeño Balls With Everything Carrots',
    yield: 4,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/cb8/cb81a5585943e9894da198844217a42d.png?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e4088c6d6fec2b27ba5c4ca0ce77678e40f76a0e2624f74514a6cf80d0b7b212',
    ingredients: [
      {
        name: 'bacon',
        category: 'cured meats',
        quantity: 4,
        measure: 'strip',
        text: '4 strips bacon'
      },
      {
        name: 'yellow onion',
        category: 'vegetables',
        quantity: 0.25,
        measure: '<unit>',
        text: '1/4 medium yellow onion'
      },
      {
        name: 'jalapeño',
        category: 'vegetables',
        quantity: 0.5,
        measure: '<unit>',
        text: '1/2 jalapeño'
      },
      {
        name: 'ground beef',
        category: 'meats',
        quantity: 1.5,
        measure: 'pound',
        text: '1 1/2 Pound ground beef'
      },
      {
        name: 'salt',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 Teaspoon salt'
      },
      {
        name: 'black pepper',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 Teaspoon ground black pepper'
      },
      {
        name: 'paprika',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 Teaspoon paprika'
      },
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 4,
        measure: 'tablespoon',
        text: '4 Tablespoons olive oil'
      },
      {
        name: 'poppy seeds',
        category: 'Condiments and sauces',
        quantity: 1.5,
        measure: 'teaspoon',
        text: '1 1/2 Teaspoon poppy seeds'
      },
      {
        name: 'sesame seeds',
        category: 'plant-based protein',
        quantity: 1.5,
        measure: 'teaspoon',
        text: '1 1/2 Teaspoon sesame seeds'
      },
      {
        name: 'caraway seeds',
        category: 'Condiments and sauces',
        quantity: 1.5,
        measure: 'teaspoon',
        text: '1 1/2 Teaspoon caraway seeds'
      },
      {
        name: 'coarse salt',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 Teaspoon coarse salt'
      },
      {
        name: 'black pepper',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 Teaspoon ground black pepper'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 3,
        measure: 'clove',
        text: '3 cloves garlic'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 2,
        measure: 'clove',
        text: '2 cloves garlic'
      },
      {
        name: 'egg yolk',
        category: 'Eggs',
        quantity: 1,
        measure: '<unit>',
        text: '1 egg yolk'
      },
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 Tablespoons plus ½ cup olive oil'
      },
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 0.5,
        measure: 'cup',
        text: '2 Tablespoons plus ½ cup olive oil'
      },
      {
        name: 'lemon juice',
        category: '100% juice',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 Tablespoons lemon juice'
      },
      {
        name: 'cider vinegar',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 Tablespoon cider vinegar'
      },
      {
        name: 'tomato paste',
        category: 'canned vegetables',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 Teaspoon tomato paste'
      },
      {
        name: 'paprika',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'teaspoon',
        text: '1/2 Teaspoon paprika'
      },
      {
        name: 'mustard powder',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'teaspoon',
        text: '1/2 Teaspoon mustard powder'
      },
      {
        name: 'cumin',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 Teaspoon ground cumin'
      },
      {
        name: 'salt',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 Teaspoon salt'
      },
      {
        name: 'cayenne pepper',
        category: 'Condiments and sauces',
        quantity: 0.125,
        measure: 'teaspoon',
        text: '1/8 Teaspoon cayenne pepper'
      },
      {
        name: 'yellow onion',
        category: 'vegetables',
        quantity: 0.25,
        measure: '<unit>',
        text: '1/4 yellow onion'
      },
      {
        name: 'pickle',
        category: 'vegetables',
        quantity: 0,
        measure: null,
        text: '1/4 Cup pickle slices'
      }
    ]
  },
  {
    label: 'Chewy Brownies',
    yield: 18,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/4ea/4ea989805e098336b9bd53a45b4dfcc1.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=73397ba78b4751f3f6b95109082f49e726850b5e2809f00c78cef654cb234282',
    ingredients: [
      {
        name: 'cocoa',
        category: 'chocolate',
        quantity: 0.3333333333333333,
        measure: 'cup',
        text: '1/3 cup cocoa'
      },
      {
        name: 'water',
        category: 'water',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup plus 2 tablespoon boiling water'
      },
      {
        name: 'water',
        category: 'water',
        quantity: 2,
        measure: 'tablespoon',
        text: '1/2 cup plus 2 tablespoon boiling water'
      },
      {
        name: 'unsweetened chocolate',
        category: 'chocolate',
        quantity: 2,
        measure: 'ounce',
        text: '2 ounces unsweetened chocolate'
      },
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 0.5,
        measure: 'stick',
        text: '4 tablespoons butter (1/2 stick), melted'
      },
      {
        name: 'vegetable oil',
        category: 'Oils',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup plus 2 tablespoons vegetable oil'
      },
      {
        name: 'vegetable oil',
        category: 'Oils',
        quantity: 2,
        measure: 'tablespoon',
        text: '1/2 cup plus 2 tablespoons vegetable oil'
      },
      {
        name: 'eggs',
        category: 'Eggs',
        quantity: 2,
        measure: '<unit>',
        text: '2 large eggs'
      },
      {
        name: 'egg yolks',
        category: 'Eggs',
        quantity: 2,
        measure: '<unit>',
        text: '2 large egg yolks'
      },
      {
        name: 'vanilla',
        category: 'Condiments and sauces',
        quantity: 2,
        measure: 'teaspoon',
        text: '2 teaspoons vanilla'
      },
      {
        name: 'sugar',
        category: 'sugars',
        quantity: 2.5,
        measure: 'cup',
        text: '2 1/2 cups sugar'
      },
      {
        name: 'all-purpose flour',
        category: 'grains',
        quantity: 1.75,
        measure: 'cup',
        text: '1 3/4 cups all-purpose flour'
      },
      {
        name: 'salt',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon salt'
      },
      {
        name: 'chocolate chips',
        category: 'chocolate',
        quantity: 1,
        measure: 'cup',
        text: '1 cup chocolate chips'
      }
    ]
  },
  {
    label: 'Corn Stuffing Muffins with Bacon',
    yield: 8,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/087/0873a135c3cad33de22334d56fde0f70.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=02b8455547a2eef70d0a56d9d818d3844890cc2009b9f8c287e9644f6991a4b9',
    ingredients: [
      {
        name: 'bacon',
        category: 'cured meats',
        quantity: 6,
        measure: 'slice',
        text: '6 slices bacon, chopped (1 slice per muffin)'
      },
      {
        name: 'celery',
        category: 'vegetables',
        quantity: 1,
        measure: 'cup',
        text: '1 rib celery, finely chopped (1 cup)'
      },
      {
        name: 'apple',
        category: 'fruit',
        quantity: 1,
        measure: 'cup',
        text: '1 apple, finely chopped (1 cup)'
      },
      {
        name: 'onion',
        category: 'vegetables',
        quantity: 1,
        measure: 'cup',
        text: '1 small onion, finely chopped (1 cup)'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'corn muffin mix',
        category: 'bread, rolls and tortillas',
        quantity: 1,
        measure: 'box',
        text: '1 box corn muffin mix'
      },
      {
        name: 'egg',
        category: 'Eggs',
        quantity: 1,
        measure: '<unit>',
        text: '1 egg'
      },
      {
        name: 'milk',
        category: 'Milk',
        quantity: 0.3333333333333333,
        measure: 'cup',
        text: '1/3 cup milk'
      },
      {
        name: 'poultry seasoning',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon poultry seasoning'
      },
      {
        name: 'nutmeg',
        category: 'Condiments and sauces',
        quantity: 0.25,
        measure: 'teaspoon',
        text: '1/4 teaspoon nutmeg'
      },
      {
        name: 'parsley',
        category: 'vegetables',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon parsley, chopped'
      },
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon butter, softened'
      }
    ]
  },
  {
    label: 'Skillet-Roasted Chicken with Rosti Potatoes and Steamed Veggies',
    yield: 12,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/4be/4bef8c5a18b78db9a122f226581f798e.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=96d66d8f49ad126f9e4c1f068f41d95f861200602508b743d826957591a92618',
    ingredients: [
      {
        name: 'Yukon Gold potatoes',
        category: 'vegetables',
        quantity: 2.25,
        measure: 'pound',
        text: '2-2 1/2 pounds baby Yukon Gold potatoes, peeled only around the middle'
      },
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 4,
        measure: 'tablespoon',
        text: '4 tablespoons butter, divided'
      },
      {
        name: 'extra virgin olive oil',
        category: 'Oils',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons extra virgin olive oil (EVOO)'
      },
      {
        name: 'boneless, skinless chicken breasts',
        category: 'Poultry',
        quantity: 4,
        measure: '<unit>',
        text: '4 boneless, skinless chicken breasts'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and ground black pepper'
      },
      {
        name: 'black pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and ground black pepper'
      },
      {
        name: 'flour',
        category: 'grains',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons flour'
      },
      {
        name: 'chicken stock',
        category: 'canned soup',
        quantity: 2,
        measure: 'cup',
        text: '2 cups chicken stock'
      },
      {
        name: 'heavy cream',
        category: 'Dairy',
        quantity: 2.5,
        measure: 'tablespoon',
        text: '2-3 tablespoons heavy cream'
      },
      {
        name: 'mustard',
        category: 'Condiments and sauces',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons grainy mustard'
      },
      {
        name: 'baby carrots',
        category: 'vegetables',
        quantity: 1,
        measure: 'pound',
        text: '1 pound baby carrots'
      },
      {
        name: 'baby zucchini',
        category: 'vegetables',
        quantity: 1,
        measure: 'pound',
        text: '1 pound baby zucchini'
      },
      {
        name: 'chives',
        category: 'vegetables',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon chopped chives'
      }
    ]
  },
  {
    label: 'Deviled Pumpkin-Eggs',
    yield: 8,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/12b/12b2bb5a577dca6fc989ecf5412b7ea7.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d34967a79d0b4437366d2f9650e13aff341bd9cc59b47cc6e494ecc144e96de4',
    ingredients: [
      {
        name: 'eggs',
        category: 'Eggs',
        quantity: 12,
        measure: '<unit>',
        text: '1 dozen large organic eggs'
      },
      {
        name: 'paprika',
        category: 'Condiments and sauces',
        quantity: 2,
        measure: 'teaspoon',
        text: '2 teaspoons paprika'
      },
      {
        name: 'smoked paprika',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon smoked paprika'
      },
      {
        name: 'cayenne pepper',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'teaspoon',
        text: '1/2 teaspoon cayenne pepper'
      },
      {
        name: 'onion',
        category: 'vegetables',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons grated onion'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 1,
        measure: 'clove',
        text: '1 clove garlic, pasted or grated'
      },
      {
        name: 'pickle relish',
        category: 'condiments and sauces',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons pickle relish'
      },
      {
        name: 'Worcestershire sauce',
        category: 'canned soup',
        quantity: 1,
        measure: 'teaspoon',
        text: 'About 1 teaspoon Worcestershire sauce'
      },
      {
        name: 'Dijon',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon mustard, yellow or Dijon'
      },
      {
        name: 'hot sauce',
        category: 'canned soup',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 teaspoons-1 tablespoon hot sauce'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'mayonnaise',
        category: 'condiments and sauces',
        quantity: 3.5,
        measure: 'tablespoon',
        text: '3-4 tablespoons mayonnaise'
      },
      {
        name: 'scallions',
        category: 'vegetables',
        quantity: 2,
        measure: '<unit>',
        text: '2 scallions, cut into 1/2-inch pieces'
      }
    ]
  },
  {
    label: 'Penne with Pancetta, Peas and Mascarpone',
    yield: 12,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/127/1272147050533d527d2ccaa721b4a179.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7dfb64458c9a1d6af051149e10b70c14218da69ba62a0f36a2cd39929309059a',
    ingredients: [
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons olive oil'
      },
      {
        name: 'pancetta',
        category: 'cured meats',
        quantity: 0.25,
        measure: 'pound',
        text: '1/4 pound pancetta, diced'
      },
      {
        name: 'onion',
        category: 'vegetables',
        quantity: 1,
        measure: '<unit>',
        text: '1 onion, finely chopped'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 2,
        measure: 'clove',
        text: '2 cloves garlic, finely chopped'
      },
      {
        name: 'dry white wine',
        category: 'wines',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup dry white wine'
      },
      {
        name: 'chicken stock',
        category: 'canned soup',
        quantity: 1,
        measure: 'cup',
        text: '1 cup chicken stock'
      },
      {
        name: 'heavy cream',
        category: 'Dairy',
        quantity: 0.25,
        measure: 'cup',
        text: '1/4 cup heavy cream'
      },
      {
        name: 'frozen peas',
        category: 'vegetables',
        quantity: 2,
        measure: 'cup',
        text: '2 cups frozen peas'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pasta',
        category: 'grains',
        quantity: 1,
        measure: 'pound',
        text: '1 pound penne pasta'
      },
      {
        name: 'mascarpone',
        category: 'Cheese',
        quantity: 0.75,
        measure: 'cup',
        text: '3/4 cup mascarpone'
      },
      {
        name: 'lemon juice',
        category: '100% juice',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon fresh lemon juice'
      },
      {
        name: 'Pecorino cheese',
        category: 'Cheese',
        quantity: 0,
        measure: null,
        text: 'Grated Pecorino cheese, for garnish'
      },
      {
        name: 'Mint',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Mint and parsley, finely chopped, for garnish'
      },
      {
        name: 'parsley',
        category: 'vegetables',
        quantity: 0,
        measure: null,
        text: 'Mint and parsley, finely chopped, for garnish'
      }
    ]
  },
  {
    label: 'Blue Cheese Ranch Mashed Potatoes',
    yield: 10,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/9b3/9b387b3e4ddbdcd7af46f2e07c364e44.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=999c920ef783941afdeeddfd60d17c1416d0acc4bde43055baec84d0e8f918d6',
    ingredients: [
      {
        name: 'potatoes',
        category: 'vegetables',
        quantity: 6,
        measure: '<unit>',
        text: '6 medium potatoes, peeled and cubed'
      },
      {
        name: 'parsnips',
        category: 'vegetables',
        quantity: 4,
        measure: '<unit>',
        text: '4 medium parsnips, peeled and sliced 1-inch thick'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt'
      },
      {
        name: 'onion powder',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon onion powder'
      },
      {
        name: 'garlic powder',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'tablespoon',
        text: '1/2 tablespoon garlic powder'
      },
      {
        name: 'buttermilk',
        category: 'Milk',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup buttermilk'
      },
      {
        name: 'sour cream',
        category: 'Dairy',
        quantity: 0.375,
        measure: 'cup',
        text: '1/4-1/2 cup sour cream'
      },
      {
        name: 'blue cheese',
        category: 'Cheese',
        quantity: 1,
        measure: 'cup',
        text: '1 cup blue cheese crumbles'
      },
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 4,
        measure: 'tablespoon',
        text: '4 tablespoons butter, sliced'
      },
      {
        name: 'parsley',
        category: 'vegetables',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup parsley, chives and dill, finely chopped'
      },
      {
        name: 'chives',
        category: 'vegetables',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup parsley, chives and dill, finely chopped'
      },
      {
        name: 'dill',
        category: 'Condiments and sauces',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup parsley, chives and dill, finely chopped'
      },
      {
        name: 'lemon',
        category: 'fruit',
        quantity: 0.5,
        measure: '<unit>',
        text: 'Zest and juice of 1/2 lemon'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and finely ground black pepper, to taste'
      },
      {
        name: 'black pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and finely ground black pepper, to taste'
      }
    ]
  },
  {
    label: 'Roast Chicken with Lemon and Artichokes',
    yield: 20,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/d24/d24ac27fd04fec30098efdeda2ac616c.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8893383b75cd1ef1f69e5b8c78c616589957b4a5e064170b966f9cd57e857cad',
    ingredients: [
      {
        name: 'lemons',
        category: 'fruit',
        quantity: 3,
        measure: '<unit>',
        text: '3 lemons, 1 halved, 2 sliced'
      },
      {
        name: 'artichokes',
        category: 'vegetables',
        quantity: 4,
        measure: '<unit>',
        text: '4 artichokes'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 2,
        measure: 'head',
        text: '2 heads garlic, top 1/4-inch of stem end sliced off'
      },
      {
        name: 'extra virgin olive oil',
        category: 'Oils',
        quantity: 4,
        measure: 'tablespoon',
        text: '4 tablespoons extra virgin olive oil (EVOO), divided'
      },
      {
        name: 'white wine',
        category: 'wines',
        quantity: 3,
        measure: 'cup',
        text: '3 cups white wine, divided'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and ground black pepper'
      },
      {
        name: 'black pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and ground black pepper'
      },
      {
        name: 'fennel seeds',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon fennel seeds'
      },
      {
        name: 'poultry seasoning',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon poultry seasoning'
      },
      {
        name: 'onion powder',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon onion powder'
      },
      {
        name: 'roasting chicken',
        category: 'Poultry',
        quantity: 4.5,
        measure: 'pound',
        text: '4-5 pound roasting chicken'
      },
      {
        name: 'onion',
        category: 'vegetables',
        quantity: 1,
        measure: '<unit>',
        text: '1 small onion, quartered'
      },
      {
        name: 'flour',
        category: 'grains',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons flour'
      },
      {
        name: 'chicken stock',
        category: 'canned soup',
        quantity: 1.5,
        measure: 'cup',
        text: '1 1/2 cups chicken stock'
      }
    ]
  },
  {
    label: 'Carbonara-Style Baked Stuffed Potatoes',
    yield: 16,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/8cf/8cff9abfcf1132c3225b6c30bd6b55e7.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=fc82cceef4703a9b29324ebba5226996d7b264bddb5223a848723cea6982266c',
    ingredients: [
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons olive oil'
      },
      {
        name: 'bacon',
        category: 'cured meats',
        quantity: 0.3333333333333333,
        measure: 'pound',
        text: '1/3 pound pancetta or lean bacon, cut into 1/4-inch dice'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 4,
        measure: 'clove',
        text: '4 cloves garlic, chopped'
      },
      {
        name: 'black pepper',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon coarse black pepper'
      },
      {
        name: 'dry white wine',
        category: 'wines',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup dry white wine'
      },
      {
        name: 'chicken stock',
        category: 'canned soup',
        quantity: 1,
        measure: 'cup',
        text: '1 cup chicken stock, warmed'
      },
      {
        name: 'egg yolks',
        category: 'Eggs',
        quantity: 4,
        measure: '<unit>',
        text: '4 egg yolks plus 4 whole eggs'
      },
      {
        name: 'eggs',
        category: 'Eggs',
        quantity: 4,
        measure: '<unit>',
        text: '4 egg yolks plus 4 whole eggs'
      },
      {
        name: 'Pecorino cheese',
        category: 'Cheese',
        quantity: 1,
        measure: 'cup',
        text: '1 cup grated Pecorino cheese'
      },
      {
        name: 'Parmigiano-Reggiano cheese',
        category: 'Cheese',
        quantity: 1,
        measure: 'cup',
        text: '1 cup grated Parmigiano-Reggiano cheese'
      },
      {
        name: 'baked potatoes',
        category: 'vegetables',
        quantity: 4,
        measure: '<unit>',
        text: '4 large baked potatoes'
      },
      {
        name: 'parsley',
        category: 'vegetables',
        quantity: 3.5,
        measure: 'tablespoon',
        text: '3 to 4 tablespoons flat-leaf parsley, chopped'
      },
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 3,
        measure: 'tablespoon',
        text: '3 tablespoons melted butter'
      }
    ]
  },
  {
    label: 'Crispy Chicken Paillard Divan',
    yield: 12,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/b2e/b2efad681f91c262c567804d86ee8dae.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c900f011429dde34dc51261456ed2c75a57de46b57e092bae4441e62da731b20',
    ingredients: [
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 4,
        measure: 'tablespoon',
        text: '4 tablespoons butter, divided'
      },
      {
        name: 'chicken',
        category: 'Poultry',
        quantity: 3,
        measure: 'tablespoon',
        text: '3 tablespoons flour plus about 1/3 cup for dredging chicken'
      },
      {
        name: 'chicken stock',
        category: 'canned soup',
        quantity: 1,
        measure: 'cup',
        text: '1 cup chicken stock'
      },
      {
        name: 'half-and-half',
        category: 'Dairy',
        quantity: 1,
        measure: 'cup',
        text: '1 cup half-and-half, warmed'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'Gruyère cheese',
        category: 'Cheese',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup grated Gruyère cheese'
      },
      {
        name: 'Parmigiano-Reggiano cheese',
        category: 'Cheese',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup grated Parmigiano-Reggiano cheese'
      },
      {
        name: 'skin-on chicken breasts',
        category: 'Poultry',
        quantity: 4,
        measure: '<unit>',
        text: '4 bone-in, skin-on chicken breasts'
      },
      {
        name: 'broccolini',
        category: 'vegetables',
        quantity: 3,
        measure: '<unit>',
        text: '3 bundles broccolini or baby broccoli'
      },
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 3,
        measure: 'tablespoon',
        text: '3 tablespoons olive oil, divided'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 2.5,
        measure: 'clove',
        text: '2 to 3 large cloves garlic, chopped'
      },
      {
        name: 'lemon',
        category: 'fruit',
        quantity: 1,
        measure: '<unit>',
        text: '1 lemon'
      },
      {
        name: 'onions',
        category: 'vegetables',
        quantity: 0,
        measure: null,
        text: 'Crispy onions, to garnish'
      }
    ]
  },
  {
    label: 'Steak Fajitas with Roasted Peppers, Onions, Sherry Mushrooms & Charred Tomato Sauce',
    yield: 22,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/c17/c17bece8a6daa05598622798bf77cac6.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=4c0ecd3ab9bc41fa74176a8cfda26b720db9a6a66eee0502b0f076af07cc1844',
    ingredients: [
      {
        name: 'vine tomatoes',
        category: 'vegetables',
        quantity: 2,
        measure: '<unit>',
        text: '2 red vine tomatoes'
      },
      {
        name: 'onion',
        category: 'vegetables',
        quantity: 2,
        measure: 'slice',
        text: '2 slices onion, about 1/2-inch thick'
      },
      {
        name: 'Cooking spray',
        category: 'Oils',
        quantity: 0,
        measure: null,
        text: 'Cooking spray'
      },
      {
        name: 'jalapeño pepper',
        category: 'vegetables',
        quantity: 1,
        measure: '<unit>',
        text: '1 red jalapeño pepper'
      },
      {
        name: 'chili peppers',
        category: 'vegetables',
        quantity: 2,
        measure: '<unit>',
        text: '2 dry guajillo or red New Mexican chili peppers, stemmed and seeded'
      },
      {
        name: 'beef stock',
        category: 'canned soup',
        quantity: 1,
        measure: 'cup',
        text: '1 cup beef stock'
      },
      {
        name: 'sherry vinegar',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon sherry vinegar'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 2,
        measure: 'clove',
        text: '2 large cloves garlic, crushed'
      },
      {
        name: 'sherry',
        category: 'wines',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup dry sherry, divided'
      },
      {
        name: 'Worcestershire sauce',
        category: 'canned soup',
        quantity: 0.25,
        measure: 'cup',
        text: '1/4 cup Worcestershire sauce'
      },
      {
        name: 'limes',
        category: 'fruit',
        quantity: 4,
        measure: '<unit>',
        text: '4 limes'
      },
      {
        name: 'beef stock',
        category: 'canned soup',
        quantity: 0.25,
        measure: 'cup',
        text: '1/4 cup beef stock'
      },
      {
        name: 'oregano',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon Mexican oregano'
      },
      {
        name: 'cumin',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon ground cumin'
      },
      {
        name: 'coriander',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon ground coriander'
      },
      {
        name: 'granulated onion',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon granulated onion'
      },
      {
        name: 'smoked paprika',
        category: 'Condiments and sauces',
        quantity: 2,
        measure: 'teaspoon',
        text: '2 teaspoons paprika or smoked paprika'
      },
      {
        name: 'agave',
        category: 'sugar syrups',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon honey or light agave'
      },
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 4,
        measure: 'tablespoon',
        text: '4 tablespoons olive oil, divided'
      },
      {
        name: 'flank steak',
        category: 'meats',
        quantity: 2,
        measure: 'pound',
        text: '2 pounds flank steak, halved lengthwise into 2 long steaks about 3 inches wide'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'poblano peppers',
        category: 'vegetables',
        quantity: 3,
        measure: '<unit>',
        text: '3 large poblano peppers, halved and seeded'
      },
      {
        name: 'red bell peppers',
        category: 'vegetables',
        quantity: 2,
        measure: '<unit>',
        text: '2 large red bell peppers, halved and seeded'
      },
      {
        name: 'onions',
        category: 'vegetables',
        quantity: 4,
        measure: 'slice',
        text: '4 thick slices onions'
      },
      {
        name: 'Cooking spray',
        category: 'Oils',
        quantity: 0,
        measure: null,
        text: 'Cooking spray'
      },
      {
        name: 'cremini mushrooms',
        category: 'vegetables',
        quantity: 1,
        measure: 'pound',
        text: '1 pound cremini mushrooms'
      },
      {
        name: 'dried thyme',
        category: 'Condiments and sauces',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons dried thyme'
      },
      {
        name: 'flour tortillas',
        category: 'bread, rolls and tortillas',
        quantity: 16,
        measure: '<unit>',
        text: '16 6-inch flour tortillas'
      },
      {
        name: 'Mexican crema',
        category: 'Dairy',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup Mexican crema'
      },
      {
        name: 'cilantro leaves',
        category: 'vegetables',
        quantity: 1,
        measure: 'handful',
        text: 'A handful of cilantro leaves'
      },
      {
        name: 'Haas avocados',
        category: 'fruit',
        quantity: 2,
        measure: '<unit>',
        text: '2 large ripe Haas avocados'
      }
    ]
  },
  {
    label: 'Porchetta-Style Pork Chops and Roasted Fennel',
    yield: 12,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/f05/f05fbe7894efa793525eae5d80efdce6.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=65681e40bc4db86dfc4872159a3ad0dc0e95cf7834db31507c3111d177797561',
    ingredients: [
      {
        name: 'bone-in pork chops',
        category: 'meats',
        quantity: 4,
        measure: '<unit>',
        text: '4 thick-cut, bone-in pork chops'
      },
      {
        name: 'olive oil',
        category: 'Oils',
        quantity: 4,
        measure: 'tablespoon',
        text: '4 tablespoons olive oil, divided'
      },
      {
        name: 'garlic',
        category: 'vegetables',
        quantity: 6,
        measure: 'clove',
        text: '6 cloves garlic, 2 chopped, 4 crushed'
      },
      {
        name: 'fennel seed',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon fennel seed'
      },
      {
        name: 'rosemary',
        category: 'Condiments and sauces',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons rosemary, finely chopped'
      },
      {
        name: 'lemon zest',
        category: 'fruit',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon lemon zest plus 4 lemon wedges'
      },
      {
        name: 'lemon',
        category: 'fruit',
        quantity: 4,
        measure: 'wedge',
        text: '1 tablespoon lemon zest plus 4 lemon wedges'
      },
      {
        name: 'black pepper',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon coarse black pepper'
      },
      {
        name: 'Kosher salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Kosher salt'
      },
      {
        name: 'fennel',
        category: 'vegetables',
        quantity: 2,
        measure: 'bulb',
        text: '2 bulbs fennel, trimmed and cut into 8 wedges each'
      },
      {
        name: 'shallots',
        category: 'vegetables',
        quantity: 8,
        measure: '<unit>',
        text: '8 large shallots, quartered lengthwise'
      },
      {
        name: 'potatoes',
        category: 'vegetables',
        quantity: 4,
        measure: '<unit>',
        text: '4 medium potatoes, cut into wedges'
      },
      {
        name: 'dry white wine',
        category: 'wines',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup dry white wine or chicken stock'
      }
    ]
  },
  {
    label: 'Apple, Cheddar and Mushroom Monte Cristos',
    yield: 12,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/31d/31d62f65d08cf67641f4a26ad05a74c1.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5ee2942e9d9bfd602136e14482877239e5de539b8a1535cb628d3548471649dd',
    ingredients: [
      {
        name: 'butter',
        category: 'Dairy',
        quantity: 6,
        measure: 'tablespoon',
        text: '6 tablespoons butter, plus more as needed, divided'
      },
      {
        name: 'white mushrooms',
        category: 'vegetables',
        quantity: 0.5,
        measure: 'pound',
        text: '1/2 pound large white mushrooms, sliced'
      },
      {
        name: 'apples',
        category: 'fruit',
        quantity: 2,
        measure: '<unit>',
        text: '2 apples, such as Braeburn or Jonagold, peeled and thinly sliced'
      },
      {
        name: 'fresh thyme',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'tablespoon',
        text: '1 tablespoon fresh thyme, chopped'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt and pepper'
      },
      {
        name: 'ground nutmeg',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'pinch',
        text: 'A pinch of freshly grated or ground nutmeg'
      },
      {
        name: 'Calvados',
        category: 'liquors and cocktails',
        quantity: 0.25,
        measure: 'cup',
        text: '1/4 cup Calvados or other brandy'
      },
      {
        name: 'creme fraiche',
        category: 'Dairy',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup creme fraiche'
      },
      {
        name: 'Dijon mustard',
        category: 'Condiments and sauces',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons Dijon mustard'
      },
      {
        name: 'whole wheat bread',
        category: 'bread, rolls and tortillas',
        quantity: 8,
        measure: 'slice',
        text: '8 slices good-quality whole wheat bread'
      },
      {
        name: 'cheddar cheese',
        category: 'Cheese',
        quantity: 16,
        measure: 'slice',
        text: '16 thin slices cheddar cheese'
      },
      {
        name: 'eggs',
        category: 'Eggs',
        quantity: 3,
        measure: '<unit>',
        text: '3 eggs'
      },
      {
        name: 'whole milk',
        category: 'Milk',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup whole milk'
      }
    ]
  },
  {
    label: 'Sweet Potato Salad with Bacon',
    yield: 6,
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/6c7/6c75f03daedeb7386f765156060dee86.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIE8domMAeB8qqjv6JmSvt%2BoEoorVmUgfR1Xb6A0UkZoFAiBUC3AfZjdyoNXFPJwmcPGfJVSLBSx45lTlXl%2FdHizzHirbBAii%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMbQ1CPT9xhSPRRYwcKq8EU%2BVo0FZ7B3Bhg%2Fk8v4iXC3pAgzzuSAqi2NIUkBwe5pyjvjZqCJwmyaaOzYo4TiHdWqriN3fnXfjAxnEii8MpTC3rIyZl8xNYOvY8C44543sFpepxT0trZsbFrHyPJG5SRr%2BEk1%2FRm3hIuOljIz%2B91qwdfdNeGxL0Fhp%2Fs2Kx%2BG0yndu2YN6RUHbyfZ2ut0hatQ6rJo50rhtiG7r0zj4Lpz1Q7rOWFkNOBq9c73b5tDha3Db4Rhh8ntKLuWZ0HZMMgNBfwNUNf0pxGzlOT%2FYeapLfGklP6xzlJBxlZ6h22pwE0XuaMgHJTZBjj53G71QjG6c2FiY7p6xD3EkjzUtibVaX50JXrRTNj5H636VkeO0oX3e0DeA1UL3HDMjA3iLDohU8wOQ9sLB4Bc%2BINJI4EMymooA%2BzKFa7KiI83Fxq2byXyL8mJUHn%2BpNKZz3Z9KLJTH9Ds4tdGds%2FvZjIMdB6PySy7D6wsM4TkgWsj7Ch4XkZf517FuraF57ByPi9MOJmjOSwLfBFIGka2tXlikkDoLDoxShN6TGLtKnLGY41xFqTZbO6cMxO805RMcjDdIdLRWGTCEYtCWCo6%2FI9Ck0STA8ibKh6lNay47uHN72PYjJctHYaLJPUnTtjhcZXQaVE6WUbALVBNI3kQJwcKmTFL0ZjOMF5usVtMbD%2B%2F8mZ3BpoTfMNqogAGx%2FKPPfBV8kGu58iF67h2U%2FCbByfLR9V8Q8JJTe6T0IpW5g78xT8TDpiK6XBjqqAb89svX74ElaGOMlKE6fk9k84ropENvmswxwscXgfvfqemNiVi96ZqP2dJIwNfsl4rNX2fOkoZ2kPcsNxs2U%2BryUGqxztVhiuYLad3w59zkcJ5pQ8IOIKNthF7dPlyL0A%2B3DhsA%2BXVR%2Bc24Ra8u69fW4EhpDthiZ5oRAMJxDhJx6A1FliywFB1octuJAVqcLwVi64TvjjKLwmZi3PMDfIJSlSxsQ4WgJfawq&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220804T093548Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFNAEZSMPC%2F20220804%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6ccce860c7f26bd554a2cf1a44bad3358d85f8af000fb8c5ce03b7c64d2b81e9',
    ingredients: [
      {
        name: 'sweet potatoes',
        category: 'vegetables',
        quantity: 1.5,
        measure: 'pound',
        text: '1 1/2 pounds sweet potatoes, peeled and cut into bite-size chunks'
      },
      {
        name: 'Salt',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Salt'
      },
      {
        name: 'Extra virgin olive oil',
        category: 'Oils',
        quantity: 0,
        measure: null,
        text: 'Extra virgin olive oil (EVOO), for liberal drizzling'
      },
      {
        name: 'bacon',
        category: 'cured meats',
        quantity: 4,
        measure: 'slice',
        text: '4 slices good-quality lean bacon, chopped'
      },
      {
        name: 'beef stock',
        category: 'canned soup',
        quantity: 0.5,
        measure: 'cup',
        text: '1/2 cup beef stock'
      },
      {
        name: 'wine vinegar',
        category: 'Condiments and sauces',
        quantity: 2,
        measure: 'tablespoon',
        text: '2 tablespoons wine vinegar'
      },
      {
        name: 'hot sauce',
        category: 'canned soup',
        quantity: 1,
        measure: 'dash',
        text: 'A few dashes of hot sauce'
      },
      {
        name: 'sweet paprika',
        category: 'Condiments and sauces',
        quantity: 1,
        measure: 'teaspoon',
        text: '1 teaspoon smoked sweet paprika or sweet paprika'
      },
      {
        name: 'black pepper',
        category: 'Condiments and sauces',
        quantity: 0,
        measure: null,
        text: 'Freshly ground black pepper'
      },
      {
        name: 'red onion',
        category: 'vegetables',
        quantity: 0.5,
        measure: '<unit>',
        text: '1/2 small red onion, finely chopped'
      },
      {
        name: 'celery',
        category: 'vegetables',
        quantity: 2.5,
        measure: 'rib',
        text: '2-3 small ribs celery, finely chopped'
      },
      {
        name: 'parsley',
        category: 'vegetables',
        quantity: 1,
        measure: 'handful',
        text: 'A handful of parsley leaves, finely chopped'
      }
    ]
  }
];
