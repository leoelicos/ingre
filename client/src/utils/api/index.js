import axios from 'axios';

const getQueryParamString = (q, diet, health, cuisineType, mealType, dishType) => {
  const params = [];
  params.push(encodeURIComponent(q));
  diet.forEach((queryParam) => params.push(`diet=${encodeURIComponent(queryParam)}`));
  health.forEach((queryParam) => params.push(`health=${encodeURIComponent(queryParam)}`));
  mealType.forEach((queryParam) => params.push(`mealType=${encodeURIComponent(queryParam)}`));
  dishType.forEach((queryParam) => params.push(`dishType=${encodeURIComponent(queryParam)}`));
  cuisineType.forEach((queryParam) => params.push(`cuisineType=${encodeURIComponent(queryParam)}`));
  return params.join('&');
};

const fetchEdamam = async (search) => {
  console.log('Received', search);
  let queryString = '%20';

  if (search) {
    const { q, diet, health, cuisineType, mealType, dishType } = search;
    queryString = getQueryParamString(q, diet, health, cuisineType, mealType, dishType);
  }

  //! we are supposed to get APP_ID from backend instead
  console.log('queryString = ', queryString);
  let uri =
    `https://api.edamam.com/api/recipes/v2?` +
    [
      'type=public',
      'beta=false',
      `app_id=${process.env.REACT_APP_PRODUCTION_EDAMAM_APP_ID}`,
      `app_key=${process.env.REACT_APP_PRODUCTION_EDAMAM_APP_KEY}`,
      'imageSize=LARGE',
      'random=true',
      'field=label',
      'field=images',
      'field=yield',
      'field=ingredients',
      `q=${queryString}`
      //
    ].join('&');
  return (
    axios
      .get(uri)
      // check response
      .then((res) => {
        if (!res) throw new Error('Edamam 404: !res');

        const data = res.data;
        if (!data) throw new Error('Edamam 404: !res.data');

        const hits = res.data.hits;
        if (!hits) throw new Error('Edamam 404: !res.data.hits');

        const blankImages = ['fe91e54771717b4aed8e279237b46b11', '323e10a433ca706efb4b22b9d8c2814e'];
        const filtered = hits.filter(({ recipe }) => {
          for (let i = 0; i < blankImages.length; i++) {
            if (recipe.images.LARGE.url.includes(blankImages[i])) return false;
          }
          return true;
        });
        return filtered;
      })
      // deserialize
      .then((hits) => {
        const deserialize = hits.map((hit) => {
          const { recipe, _links } = hit;
          const edamamId = _links.self.href.split('https://api.edamam.com/api/recipes/v2/')[1].split('?')[0];
          // console.log('edamamId', edamamId);
          const name = recipe.label?.trim() || 'Generic';
          const portions = parseInt(recipe.yield) || 2;
          const picture_url = recipe.images.LARGE.url || '../../assets/ingre.png';
          const ingredients = recipe.ingredients.map((ingredient) => {
            const name = ingredient.food?.trim() || 'Generic';
            const quantity = parseFloat(ingredient.quantity) || 1;
            const measure = ingredient.measure?.trim().replace(/[<>]+/g, '') || 'unit';
            const category = ingredient.foodCategory?.trim() || 'Generic';
            const foodId = ingredient.foodId;
            const parsedIngredient = { name, quantity, measure, category, foodId };
            return parsedIngredient;
          });

          const parsedHit = { name, portions, picture_url, ingredients, edamamId };
          return parsedHit;
        });
        return deserialize;
      })
      .catch((err) => console.error(err))
  );
};

export default fetchEdamam;
