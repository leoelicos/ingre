import axios from 'axios';

const fetchEdamam = async (q, diet, health, cuisineType, mealType, dishType) => {
  // console.log('[fetchEdamam]', q, diet, health, cuisineType, mealType, dishType);
  // get Edamam credentials from server

  // helper function to encode arrays into query params
  const encode = (arr, param, defaultVal) => (!arr || !arr.length ? `${param}=${defaultVal}` : arr.map((val) => `${param}=${encodeURIComponent(val)}`).join('&'));
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
      'field=image',
      'field=yield',
      'field=ingredients',
      `q=${q ? encodeURIComponent(q) : 'Delicious'}`,
      encode(diet, 'diet', 'balanced'),
      encode(health, 'health', 'vegetarian'),
      encode(mealType, 'mealType', 'Dinner'),
      encode(dishType, 'dishType', 'Main%20course'),
      encode(cuisineType, 'cuisineType', 'Italian')
      //
    ].join('&');
  console.log('uri = ', uri);
  return (
    axios
      .get(uri)
      // check response
      .then((res) => {
        console.log('res =', res);
        if (!res) throw new Error('Edamam 404: !res');
        if (!res.data) throw new Error('Edamam 404: !res.data');
        if (!res.data.hits) throw new Error('Edamam 404: !res.data.hits');
        return res.data.hits;
      })
      // deserialize
      .then((hits) => {
        const deserialize = hits.map(({ recipe: { label: name, yield: portions, image: picture_url, ingredients } }) => ({
          name: name?.trim(),
          portions: portions ? parseInt(portions) : 2,
          picture_url,
          ingredients: ingredients.map(({ food: name, quantity, measure, foodCategory: category, foodId }) => ({
            name: name?.trim() || 'Generic',
            quantity: quantity ? parseFloat(quantity) : 1,
            measure: measure?.trim().replace(/[<>]+/g, '') || 'unit',
            category: category?.trim() || 'Generic',
            foodId
          }))
        }));
        console.log('[fetchEdamam] deserialize', deserialize);
        return deserialize;
      })

      .catch((err) => console.error(err))
  );
};

export default fetchEdamam;
