// ApolloClient

import axios from 'axios'

const getQueryParamString = (
  q,
  diet,
  health,
  cuisineType,
  mealType,
  dishType
) => {
  const params = []
  params.push(encodeURIComponent(q))
  diet.forEach((queryParam) =>
    params.push(`diet=${encodeURIComponent(queryParam)}`)
  )
  health.forEach((queryParam) =>
    params.push(`health=${encodeURIComponent(queryParam)}`)
  )
  mealType.forEach((queryParam) =>
    params.push(`mealType=${encodeURIComponent(queryParam)}`)
  )
  dishType.forEach((queryParam) =>
    params.push(`dishType=${encodeURIComponent(queryParam)}`)
  )
  cuisineType.forEach((queryParam) =>
    params.push(`cuisineType=${encodeURIComponent(queryParam)}`)
  )
  return params.join('&')
}

const fetchEdamam = async (search, appId, appKey) => {
  let uri =
    `https://api.edamam.com/api/recipes/v2?` +
    [
      'type=public',
      'beta=false',
      `app_id=${appId}`,
      `app_key=${appKey}`,
      'imageSize=LARGE',
      'random=true',
      'field=label',
      'field=images',
      'field=yield',
      'field=ingredients',
      'field=shareAs',
      `q=${
        search
          ? getQueryParamString(
              search.q,
              search.diet,
              search.health,
              search.cuisineType,
              search.mealType,
              search.dishType
            )
          : '%20'
      }`
      //
    ].join('&')
  const testing = 1
  if (testing) return mockData
  return (
    axios
      .get(uri)
      // check response
      .then((res) => {
        if (!res) throw new Error('Edamam 404: !res')

        const data = res.data
        if (!data) throw new Error('Edamam 404: !res.data')

        const hits = res.data.hits
        if (!hits) throw new Error('Edamam 404: !res.data.hits')

        return hits
      })
      // deserialize
      .then((hits) => {
        const deserialize = hits.map((hit) => {
          const { recipe, _links } = hit
          const edamamId = _links.self.href
            .split('https://api.edamam.com/api/recipes/v2/')[1]
            .split('?')[0]
          // console.log('edamamId', edamamId);
          const name = recipe.label?.trim() || 'Generic'
          const portions = parseInt(recipe.yield) || 2
          const image = recipe.images.LARGE.url
          const picture_url =
            !image ||
            image.indexOf('fe91e54771717b4aed8e279237b46b11') !== -1 ||
            image.indexOf('323e10a433ca706efb4b22b9d8c2814e') !== -1
              ? 'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
              : image
          const instructions = recipe.shareAs
          const ingredients = recipe.ingredients.map((ingredient) => {
            const name = ingredient.food?.trim() || 'Generic'
            const quantity = parseFloat(ingredient.quantity) || 1
            const measure =
              ingredient.measure?.trim().replace(/[<>]+/g, '') || 'unit'
            const category = ingredient.foodCategory?.trim() || 'Generic'
            const foodId = ingredient.foodId
            const parsedIngredient = {
              name,
              quantity,
              measure,
              category,
              foodId
            }
            return parsedIngredient
          })

          const parsedHit = {
            name,
            portions,
            picture_url,
            instructions,
            ingredients,
            edamamId
          }
          return parsedHit
        })
        return deserialize
      })
      .catch((err) => console.error(err))
  )
}

export default fetchEdamam

const mockData = [
  {
    name: 'Italian Meatloaf',
    portions: 4,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/bab/babf951f1f8b6747b9207d89b28cc250-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014154Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6907d6b410714211b1c8a101e8bcb6c95856290e513487cb35cccd3beb6c1af5',
    instructions:
      'http://www.edamam.com/recipe/italian-meatloaf-823cc831d696c7f9bc3277bce38d73a2/-',
    ingredients: [
      {
        name: 'ground beef',
        quantity: 1,
        measure: 'pound',
        category: 'meats',
        foodId: 'food_boq91pbbhklr6sb0d9sbybzgklkm'
      },
      {
        name: 'parsley',
        quantity: 1,
        measure: 'tablespoon',
        category: 'vegetables',
        foodId: 'food_b244pqdazw24zobr5vqu2bf0uid8'
      },
      {
        name: 'marinara sauce',
        quantity: 1,
        measure: 'cup',
        category: 'canned soup',
        foodId: 'food_a7hv5mybkkrs3ub78yhtxafs67bu'
      },
      {
        name: 'eggs',
        quantity: 2,
        measure: 'unit',
        category: 'Eggs',
        foodId: 'food_bhpradua77pk16aipcvzeayg732r'
      },
      {
        name: 'onion',
        quantity: 1,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy'
      },
      {
        name: 'breadcrumbs',
        quantity: 0.75,
        measure: 'cup',
        category: 'bread, rolls and tortillas',
        foodId: 'food_ata1dxza443wfda7jb4e5b3zwt9p'
      },
      {
        name: 'parmesan cheese',
        quantity: 1,
        measure: 'cup',
        category: 'Cheese',
        foodId: 'food_a104ppxa06d3emb272fkcab3cugd'
      },
      {
        name: 'extra-virgin olive oil',
        quantity: 2,
        measure: 'tablespoon',
        category: 'Oils',
        foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7'
      },
      {
        name: 'Worcestershire sauce',
        quantity: 1,
        measure: 'tablespoon',
        category: 'canned soup',
        foodId: 'food_ahb8mscbejo58ubexo0itam1i74g'
      },
      {
        name: 'salt',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      },
      {
        name: 'garlic',
        quantity: 3,
        measure: 'clove',
        category: 'vegetables',
        foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp'
      },
      {
        name: 'basil',
        quantity: 2,
        measure: 'tablespoon',
        category: 'Condiments and sauces',
        foodId: 'food_bfeht3obd58c3gak5ehpibxgbbs6'
      },
      {
        name: 'red pepper',
        quantity: 1,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_a8g63g7ak6bnmvbu7agxibp4a0dy'
      },
      {
        name: 'balsamic vinegar',
        quantity: 1,
        measure: 'tablespoon',
        category: 'Condiments and sauces',
        foodId: 'food_b1ic8tzapja8jubas1f8lbhpbn6x'
      },
      {
        name: 'black pepper',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89'
      }
    ],
    edamamId: '823cc831d696c7f9bc3277bce38d73a2'
  },
  {
    name: 'Spicy Tomato Martini',
    portions: 2,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/7cb/7cb20c62efcf8b0eef3be55ead7a47d1-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=79c8196a2184b971024dac47fd42fab836359f4494ac08622b83f6a4c5874ecd',
    instructions:
      'http://www.edamam.com/recipe/spicy-tomato-martini-3476fad38386219bb1077bb7f314ba79/-',
    ingredients: [
      {
        name: 'vodka',
        quantity: 2,
        measure: 'ounce',
        category: 'liquors and cocktails',
        foodId: 'food_aqnx4i8aieyph2athk58cb3cr69w'
      },
      {
        name: 'clamato',
        quantity: 1,
        measure: 'ounce',
        category: 'canned seafood',
        foodId: 'food_adzhedzbzoks6kaonjtjaba1v5il'
      },
      {
        name: 'tabasco',
        quantity: 2,
        measure: 'dash',
        category: 'canned soup',
        foodId: 'food_abu9ntfby2jdmxa2dhtlgbub8dlu'
      }
    ],
    edamamId: '3476fad38386219bb1077bb7f314ba79'
  },
  {
    name: 'Raspberry Chia Pudding',
    portions: 2,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/bdb/bdb20d55a066dc8d139d79635d17b5de-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=dc28de0091b3852d6fa6d1a1cae82e86557062fee1338b3ca484abe44448a3b7',
    instructions:
      'http://www.edamam.com/recipe/raspberry-chia-pudding-7d928c1e1e073ce89408601d7f20f492/-',
    ingredients: [
      {
        name: 'almond milk',
        quantity: 1,
        measure: 'cup',
        category: 'Vegan products',
        foodId: 'food_aa8o4pkbhgkey4btmg1daaclqmww'
      },
      {
        name: 'raspberries',
        quantity: 1,
        measure: 'cup',
        category: 'fruit',
        foodId: 'food_al3e7s2a1lm4i6bga7o0abp399zg'
      },
      {
        name: 'chia seeds',
        quantity: 3,
        measure: 'tablespoon',
        category: 'plant-based protein',
        foodId: 'food_aifjb1oaozpl1nbw7g92oa54ists'
      },
      {
        name: 'agave syrup',
        quantity: 1,
        measure: 'tablespoon',
        category: 'chocolate',
        foodId: 'food_anhsjo8ab8fxtobor302faa2w42g'
      }
    ],
    edamamId: '7d928c1e1e073ce89408601d7f20f492'
  },
  {
    name: 'Mexican Stuffed Peppers',
    portions: 8,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/6b2/6b26df22dbc80dfd478ab060f50d69ec-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a043da2802aca5264a023dcc9d859284efcec08929186a3ee4f6b84c25dab478',
    instructions:
      'http://www.edamam.com/recipe/mexican-stuffed-peppers-95fd2f6366ad72fe8e28f0b2bb2dfb20/-',
    ingredients: [
      {
        name: 'bell pepper',
        quantity: 6,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_a8g63g7ak6bnmvbu7agxibp4a0dy'
      },
      {
        name: 'olive oil',
        quantity: 1,
        measure: 'tablespoon',
        category: 'Oils',
        foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7'
      },
      {
        name: 'onion',
        quantity: 1,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy'
      },
      {
        name: 'jalapeno pepper',
        quantity: 1,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_b7txsnbadj6plsbq27zvwah80r6y'
      },
      {
        name: 'garlic',
        quantity: 1,
        measure: 'clove',
        category: 'vegetables',
        foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp'
      },
      {
        name: 'chili powder',
        quantity: 2,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_aii2sclb4r123rbfr2ybjasrl3nc'
      },
      {
        name: 'cumin',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a8jjbx4biqndasapojdb5by3e92e'
      },
      {
        name: 'dried oregano',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_bkkw6v3bdf0sqiazmzyuiax7i8jr'
      },
      {
        name: 'rice',
        quantity: 1,
        measure: 'grain',
        category: 'grains',
        foodId: 'food_bpumdjzb5rtqaeabb0kbgbcgr4t9'
      },
      {
        name: 'tomato sauce',
        quantity: 15,
        measure: 'ounce',
        category: 'canned vegetables',
        foodId: 'food_altklniaqmdz3eb1rlf1ybjv8ihn'
      },
      {
        name: 'water',
        quantity: 0.3333333333333333,
        measure: 'cup',
        category: 'water',
        foodId: 'food_a99vzubbk1ayrsad318rvbzr3dh0'
      },
      {
        name: 'black bean',
        quantity: 1,
        measure: 'can',
        category: 'plant-based protein',
        foodId: 'food_bazzo85azdbkmsb56nu4ra5rphoe'
      },
      {
        name: 'frozen corn',
        quantity: 1,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_batr9szb8bdeqqb03sa52a0llnri'
      },
      {
        name: 'cilantro',
        quantity: 0.3333333333333333,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_alhzhuwb4lc7jnb5s6f02by60bzp'
      },
      {
        name: 'cheese',
        quantity: 1,
        measure: 'cup',
        category: 'Cheese',
        foodId: 'food_bhppgmha1u27voagb8eptbp9g376'
      },
      {
        name: 'salt',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      },
      {
        name: 'pepper',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89'
      },
      {
        name: 'sour cream',
        quantity: 1,
        measure: 'unit',
        category: 'Dairy',
        foodId: 'food_adp9fcubzl3lr7bcvzn3rbfiiiwq'
      },
      {
        name: 'salsa',
        quantity: 1,
        measure: 'unit',
        category: 'canned soup',
        foodId: 'food_b0t3obfawlm5k2b6erxscacez35u'
      },
      {
        name: 'avocado',
        quantity: 1,
        measure: 'unit',
        category: 'fruit',
        foodId: 'food_b0yuze4b1g3afpanijno5abtiu28'
      },
      {
        name: 'cheese',
        quantity: 1,
        measure: 'unit',
        category: 'Cheese',
        foodId: 'food_bhppgmha1u27voagb8eptbp9g376'
      }
    ],
    edamamId: '95fd2f6366ad72fe8e28f0b2bb2dfb20'
  },
  {
    name: 'Navratna Dal - Mixed Dal Recipe',
    portions: 2,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/7d4/7d463308620217eaed530e3757641763-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=45b7c92891a57d6db8583e1575f3f3160cdd96e56402408a04da1c46a529a56e',
    instructions:
      'http://www.edamam.com/recipe/navratna-dal-mixed-dal-recipe-94dbfc932327be0afaaec4e137f470d6/-',
    ingredients: [
      {
        name: 'rajma',
        quantity: 1,
        measure: 'tablespoon',
        category: 'plant-based protein',
        foodId: 'food_ahio05dabh55dlahaywxia52grk4'
      },
      {
        name: 'chickpea',
        quantity: 1,
        measure: 'tablespoon',
        category: 'plant-based protein',
        foodId: 'food_baux5rqbkto336asd7w3lbbi1koo'
      },
      {
        name: 'chickpea',
        quantity: 1,
        measure: 'tablespoon',
        category: 'plant-based protein',
        foodId: 'food_baux5rqbkto336asd7w3lbbi1koo'
      },
      {
        name: 'black eyed pea',
        quantity: 1,
        measure: 'tablespoon',
        category: 'vegetables',
        foodId: 'food_bg7d14ha9q9wh5a0nwmn4as6jwb2'
      },
      {
        name: 'green pea',
        quantity: 1,
        measure: 'tablespoon',
        category: 'vegetables',
        foodId: 'food_bbi35jtbjt7un9bsa2m7eazlsk91'
      },
      {
        name: 'moong dal',
        quantity: 1,
        measure: 'tablespoon',
        category: 'vegetables',
        foodId: 'food_a8l38voaf1algubwcsji2a8z2yh3'
      },
      {
        name: 'urad dal',
        quantity: 1,
        measure: 'tablespoon',
        category: 'plant-based protein',
        foodId: 'food_baux5rqbkto336asd7w3lbbi1koo'
      },
      {
        name: 'chana dal',
        quantity: 1,
        measure: 'tablespoon',
        category: 'plant-based protein',
        foodId: 'food_baux5rqbkto336asd7w3lbbi1koo'
      },
      {
        name: 'dal',
        quantity: 1,
        measure: 'tablespoon',
        category: 'plant-based protein',
        foodId: 'food_bg13k5uafva4jta78xnjcaqkli85'
      }
    ],
    edamamId: '94dbfc932327be0afaaec4e137f470d6'
  },
  {
    name: 'Avocado Fries Recipe',
    portions: 6,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/07c/07c4deefdf847102f822d43f5adb0553-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c84e0f1ed61624dd2cf98ba46e858d928b2908a9afbc5240bd1e4d74c4eece1a',
    instructions:
      'http://www.edamam.com/recipe/avocado-fries-recipe-fc0ac9947504c33a9ca0579aa3ba1121/-',
    ingredients: [
      {
        name: 'panko breadcrumb',
        quantity: 0.75,
        measure: 'cup',
        category: 'grains',
        foodId: 'food_a9tnk2lbj0xkckbytqnx1ajhpqbp'
      },
      {
        name: 'ground flax',
        quantity: 1.5,
        measure: 'tablespoon',
        category: 'grains',
        foodId: 'food_auaq2zsa87h332b65eo4ib7dz1qx'
      },
      {
        name: 'chia seed',
        quantity: 1,
        measure: 'teaspoon',
        category: 'plant-based protein',
        foodId: 'food_aifjb1oaozpl1nbw7g92oa54ists'
      },
      {
        name: 'chili powder',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_aii2sclb4r123rbfr2ybjasrl3nc'
      },
      {
        name: 'egg',
        quantity: 1,
        measure: 'unit',
        category: 'Eggs',
        foodId: 'food_bhpradua77pk16aipcvzeayg732r'
      },
      {
        name: 'avocado',
        quantity: 2.5,
        measure: 'unit',
        category: 'fruit',
        foodId: 'food_b0yuze4b1g3afpanijno5abtiu28'
      },
      {
        name: 'salt',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      },
      {
        name: 'lime',
        quantity: 1,
        measure: 'unit',
        category: 'fruit',
        foodId: 'food_av58muyb8kg92fbk0g8g8aui5knv'
      }
    ],
    edamamId: 'fc0ac9947504c33a9ca0579aa3ba1121'
  },
  {
    name: 'Spanish-style rice with chicken and chorizo',
    portions: 4,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/a0f/a0f6efc8b186c4b70507104b56ade0dd-l.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5cc76a6aca9a3ac650157347307eef5c16b1130f685d7d25f17ea930921b58fd',
    instructions:
      'http://www.edamam.com/recipe/spanish-style-rice-with-chicken-and-chorizo-056ae2bebadc6cc4842d668d3953952f/-',
    ingredients: [
      {
        name: 'vegetable oil',
        quantity: 2,
        measure: 'tablespoon',
        category: 'Oils',
        foodId: 'food_bt1mzi2ah2sfg8bv7no1qai83w8s'
      },
      {
        name: 'chorizo',
        quantity: 1,
        measure: 'sausage',
        category: 'Cured meats',
        foodId: 'food_a011ctbbqlxv1ebqtemvla9v6mpa'
      },
      {
        name: 'red onions',
        quantity: 2,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy'
      },
      {
        name: 'capsicum',
        quantity: 1,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_a8g63g7ak6bnmvbu7agxibp4a0dy'
      },
      {
        name: 'chicken',
        quantity: 300,
        measure: 'gram',
        category: 'Poultry',
        foodId: 'food_bmyxrshbfao9s1amjrvhoauob6mo'
      },
      {
        name: 'brown rice',
        quantity: 300,
        measure: 'gram',
        category: 'grains',
        foodId: 'food_aro09r9avsklizbsberuoaegj0uh'
      },
      {
        name: 'dry white wine',
        quantity: 125,
        measure: 'milliliter',
        category: 'wines',
        foodId: 'food_a656mk2a5dmqb2adiamu6beihduu'
      },
      {
        name: 'sweet paprika',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a9dpcnjb883g67b3lq82ca0421ql'
      },
      {
        name: 'cherry tomatoes',
        quantity: 400,
        measure: 'gram',
        category: 'canned vegetables',
        foodId: 'food_bnmkkwqa9h2p87bz171eoby0bsey'
      },
      {
        name: 'stock',
        quantity: 500,
        measure: 'milliliter',
        category: 'canned soup',
        foodId: 'food_bptblvzambd16nbhewqmhaw1rnh5'
      }
    ],
    edamamId: '056ae2bebadc6cc4842d668d3953952f'
  },
  {
    name: 'Upside-down roast chicken',
    portions: 4,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/598/598f728bb324d8cf8d25ca71e7c544a3-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5f2e354ad4a6a863b3824c59d4c59522c47219f87f65afe9f953297d94b625da',
    instructions:
      'http://www.edamam.com/recipe/upside-down-roast-chicken-bb54779c1998720731f8d7f8eb2f035c/-',
    ingredients: [
      {
        name: 'chicken',
        quantity: 1.7999999523162842,
        measure: 'kilogram',
        category: 'Poultry',
        foodId: 'food_bmyxrshbfao9s1amjrvhoauob6mo'
      },
      {
        name: 'bay leaf',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_asx39x4ayja4jab6ivj6zayvkblo'
      },
      {
        name: 'lemons',
        quantity: 3,
        measure: 'unit',
        category: 'fruit',
        foodId: 'food_a6uzc62astrxcgbtzyq59b6fncrr'
      },
      {
        name: 'garlic',
        quantity: 6,
        measure: 'clove',
        category: 'vegetables',
        foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp'
      },
      {
        name: 'oregano',
        quantity: 1,
        measure: 'bunch',
        category: 'Condiments and sauces',
        foodId: 'food_bkkw6v3bdf0sqiazmzyuiax7i8jr'
      },
      {
        name: 'extra virgin olive oil',
        quantity: 80,
        measure: 'milliliter',
        category: 'Oils',
        foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7'
      },
      {
        name: 'sumac',
        quantity: 3,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_amhfn8dafm8dfebu871doayr9k9q'
      },
      {
        name: 'cumin',
        quantity: 3,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a8jjbx4biqndasapojdb5by3e92e'
      },
      {
        name: 'carrots',
        quantity: 2,
        measure: 'bunch',
        category: 'vegetables',
        foodId: 'food_ai215e5b85pdh5ajd4aafa3w2zm8'
      },
      {
        name: 'red onions',
        quantity: 2,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy'
      },
      {
        name: 'green chillies',
        quantity: 4,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_bv2gevdbd1orbiarnp1vfaez1r85'
      },
      {
        name: 'can chickpeas',
        quantity: 400,
        measure: 'gram',
        category: 'plant-based protein',
        foodId: 'food_a63lcoybzox4krbbrj8eba9g8cz5'
      }
    ],
    edamamId: 'bb54779c1998720731f8d7f8eb2f035c'
  },
  {
    name: 'Coconut Coffee Ice Cream',
    portions: 6,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/cfa/cfaac28414fd7e82cd894b09c22b00f6-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=3d00048901e1418d0c17c37e4008d1284a74e0bf06106e1ecdcdaf235c299a03',
    instructions:
      'http://www.edamam.com/recipe/coconut-coffee-ice-cream-128e6a358d43535bc03dac1f67e04d0d/-',
    ingredients: [
      {
        name: 'coconut milk',
        quantity: 2.5,
        measure: 'cup',
        category: 'non-dairy beverages',
        foodId: 'food_by1k6v2adj7drhbq9w1rpbpen9ms'
      },
      {
        name: 'gelatin',
        quantity: 2,
        measure: 'teaspoon',
        category: 'candy',
        foodId: 'food_bh3w81wbiqrfmhbaw9hgwa3u7lky'
      },
      {
        name: 'cream',
        quantity: 1,
        measure: 'unit',
        category: 'Dairy',
        foodId: 'food_bvhbvd7bwy6a7wamfrmvmbmen1sz'
      },
      {
        name: 'salt',
        quantity: 0.125,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      },
      {
        name: 'stevia',
        quantity: 0.75,
        measure: 'teaspoon',
        category: 'sugars',
        foodId: 'food_a2tv4r6al9tnrba5whjr7beroouo'
      },
      {
        name: 'vanilla extract',
        quantity: 1,
        measure: 'tablespoon',
        category: 'Condiments and sauces',
        foodId: 'food_bh1wvnqaw3q7ciascfoygaabax2a'
      },
      {
        name: 'instant coffee',
        quantity: 2.5,
        measure: 'teaspoon',
        category: 'coffee and tea',
        foodId: 'food_aof7z08ad0qgsta38run7arojif8'
      },
      {
        name: 'cream cheese',
        quantity: 3,
        measure: 'ounce',
        category: 'Cheese',
        foodId: 'food_a7rvc49a09a7yjbq3ekjbbauyoqa'
      },
      {
        name: 'ice cream',
        quantity: 1,
        measure: 'teaspoon',
        category: 'frozen treats',
        foodId: 'food_bsg87una16tr8waipd66na9drm1k'
      }
    ],
    edamamId: '128e6a358d43535bc03dac1f67e04d0d'
  },
  {
    name: 'Pretzel Dough',
    portions: 6,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/372/3725f708bf7aab72a24704ff308af6d5-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5ee7c2db8b8952ed7dd7ec66599f2f1dc954f897aefab6c70c0e0306fe0bb5dd',
    instructions:
      'http://www.edamam.com/recipe/pretzel-dough-66ded4e80d78e04bfc504a7e53c8e763/-',
    ingredients: [
      {
        name: 'Brown sugar',
        quantity: 2,
        measure: 'tablespoon',
        category: 'sugars',
        foodId: 'food_aodgtqwbmeu5f6bxeffn0art3bga'
      },
      {
        name: 'milk',
        quantity: 1,
        measure: 'cup',
        category: 'Milk',
        foodId: 'food_b49rs1kaw0jktabzkg2vvanvvsis'
      },
      {
        name: 'Flour',
        quantity: 2.5,
        measure: 'cup',
        category: 'grains',
        foodId: 'food_ahebfs0a985an4aubqaebbipra58'
      },
      {
        name: 'Yeast',
        quantity: 1,
        measure: 'package',
        category: 'condiments and sauces',
        foodId: 'food_a2xisx4br72i19btvvxgzayoelqj'
      }
    ],
    edamamId: '66ded4e80d78e04bfc504a7e53c8e763'
  },
  {
    name: 'Chocolate Chip Cheesecake Swirl Cupcakes',
    portions: 24,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/983/983aa9390fb7fe7d7768863cf7ec3e94-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2964e16e98d5354cc1977a484b8f4afdf2e9a2b1cd7a77f9d431618e33c03782',
    instructions:
      'http://www.edamam.com/recipe/chocolate-chip-cheesecake-swirl-cupcakes-82b6a16d9fe500b697a11c500fe60845/-',
    ingredients: [
      {
        name: 'sugar',
        quantity: 0.5,
        measure: 'cup',
        category: 'sugars',
        foodId: 'food_axi2ijobrk819yb0adceobnhm1c2'
      },
      {
        name: 'cream cheese',
        quantity: 6,
        measure: 'ounce',
        category: 'Cheese',
        foodId: 'food_a7rvc49a09a7yjbq3ekjbbauyoqa'
      },
      {
        name: 'egg',
        quantity: 1,
        measure: 'unit',
        category: 'Eggs',
        foodId: 'food_bhpradua77pk16aipcvzeayg732r'
      },
      {
        name: 'semisweet chocolate chips',
        quantity: 1,
        measure: 'cup',
        category: 'chocolate',
        foodId: 'food_beu5dozavhrqdpblca414a55qow3'
      },
      {
        name: 'all-purpose flour',
        quantity: 2.25,
        measure: 'cup',
        category: 'grains',
        foodId: 'food_ar3x97tbq9o9p6b6gzwj0am0c81l'
      },
      {
        name: 'sugar',
        quantity: 1.6666666666666665,
        measure: 'cup',
        category: 'sugars',
        foodId: 'food_axi2ijobrk819yb0adceobnhm1c2'
      },
      {
        name: 'cocoa',
        quantity: 0.25,
        measure: 'cup',
        category: 'chocolate',
        foodId: 'food_afcmkjjaqwjkezbfz7htdb7mpkwz'
      },
      {
        name: 'water',
        quantity: 1.25,
        measure: 'cup',
        category: 'water',
        foodId: 'food_a99vzubbk1ayrsad318rvbzr3dh0'
      },
      {
        name: 'vegetable oil',
        quantity: 0.5,
        measure: 'cup',
        category: 'Oils',
        foodId: 'food_bt1mzi2ah2sfg8bv7no1qai83w8s'
      },
      {
        name: 'white vinegar',
        quantity: 2,
        measure: 'tablespoon',
        category: 'Condiments and sauces',
        foodId: 'food_am3vwadag9arxtadrwyfcau2w3b2'
      },
      {
        name: 'baking soda',
        quantity: 2,
        measure: 'teaspoon',
        category: 'condiments and sauces',
        foodId: 'food_asa4cjoa3lmt8ibwdg0cpblheo69'
      },
      {
        name: 'vanilla',
        quantity: 2,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_bh1wvnqaw3q7ciascfoygaabax2a'
      },
      {
        name: 'salt',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      }
    ],
    edamamId: '82b6a16d9fe500b697a11c500fe60845'
  },
  {
    name: 'Kala chana chaat / Black chickpea salad',
    portions: 6,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/775/7753bb90766da9c3cabd4b01a55dae38-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=9bf8e859b7edd96b7dff38671bc066ac0c1567d6fe56bf6945c5d3d3552d7e7b',
    instructions:
      'http://www.edamam.com/recipe/kala-chana-chaat-black-chickpea-salad-8228d449d42c7d92534b8f1b9f3b3e29/-',
    ingredients: [
      {
        name: 'chickpea',
        quantity: 2,
        measure: 'cup',
        category: 'plant-based protein',
        foodId: 'food_baux5rqbkto336asd7w3lbbi1koo'
      },
      {
        name: 'potato',
        quantity: 1,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_abiw5baauresjmb6xpap2bg3otzu'
      },
      {
        name: 'red onion',
        quantity: 0.5,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy'
      },
      {
        name: 'tomato',
        quantity: 0.5,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_a6k79rrahp8fe2b26zussa3wtkqh'
      },
      {
        name: 'cucumber',
        quantity: 0.5,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_bv7aggjag9rxsaatklqzobca5fzn'
      },
      {
        name: 'radish',
        quantity: 0.5,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_bs6xkukbtd85e7b2lh5zfazpe45y'
      },
      {
        name: 'mango',
        quantity: 0.5,
        measure: 'cup',
        category: 'fruit',
        foodId: 'food_an1dqoib8xj3tyb3pr7c0abi4rbw'
      },
      {
        name: 'red chilli',
        quantity: 1,
        measure: 'teaspoon',
        category: 'vegetables',
        foodId: 'food_a6g98mqatzj7vca6ms3bnbzqxf3s'
      },
      {
        name: 'green chilli',
        quantity: 1,
        measure: 'teaspoon',
        category: 'vegetables',
        foodId: 'food_bv2gevdbd1orbiarnp1vfaez1r85'
      },
      {
        name: 'salt',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      },
      {
        name: 'masala',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_bwlqp2wb01krjcbnzizdga6et64z'
      },
      {
        name: 'mango',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'fruit',
        foodId: 'food_an1dqoib8xj3tyb3pr7c0abi4rbw'
      },
      {
        name: 'cumin',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a8jjbx4biqndasapojdb5by3e92e'
      },
      {
        name: 'lime',
        quantity: 1,
        measure: 'unit',
        category: 'fruit',
        foodId: 'food_av58muyb8kg92fbk0g8g8aui5knv'
      },
      {
        name: 'cilantro',
        quantity: 2,
        measure: 'tablespoon',
        category: 'vegetables',
        foodId: 'food_alhzhuwb4lc7jnb5s6f02by60bzp'
      },
      {
        name: 'mung',
        quantity: 1,
        measure: 'handful',
        category: 'plant-based protein',
        foodId: 'food_b3ar4t3b8j8fsza6l5dhcbfbgzrp'
      }
    ],
    edamamId: '8228d449d42c7d92534b8f1b9f3b3e29'
  },
  {
    name: 'Pressure Cooker Pepperoni Pizza Pasta',
    portions: 8,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/12f/12fc1c7ce16eda6cc66aa9624f664634-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=f9685cabd0aebd30c87065c387ca873e25c8fc843ce7e413118e3d52b95c4ebb',
    instructions:
      'http://www.edamam.com/recipe/pressure-cooker-pepperoni-pizza-pasta-25b4dee4d738768ec944a9e1237f4bd8/-',
    ingredients: [
      {
        name: 'Sausage',
        quantity: 1,
        measure: 'pound',
        category: 'Cured meats',
        foodId: 'food_aidvlr4a5hvqixbbd5rbhbb3wiri'
      },
      {
        name: 'onion',
        quantity: 1,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy'
      },
      {
        name: 'kosher salt',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a1vgrj1bs8rd1majvmd9ubz8ttkg'
      },
      {
        name: 'dried oregano',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_bkkw6v3bdf0sqiazmzyuiax7i8jr'
      },
      {
        name: 'dried basil',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_abrithza96sev8ae5za0paqf42o0'
      },
      {
        name: 'black pepper',
        quantity: 0.25,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89'
      },
      {
        name: 'crushed red pepper',
        quantity: 0.25,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a8iooz3aris8gba605l07brngnrx'
      },
      {
        name: 'garlic',
        quantity: 6,
        measure: 'clove',
        category: 'vegetables',
        foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp'
      },
      {
        name: 'red wine',
        quantity: 1,
        measure: 'cup',
        category: 'wines',
        foodId: 'food_b5q0xv2ba8la5hbzdfzdgaca3fwu'
      },
      {
        name: 'San Marzano tomatoes',
        quantity: 28,
        measure: 'ounce',
        category: 'vegetables',
        foodId: 'food_a6k79rrahp8fe2b26zussa3wtkqh'
      },
      {
        name: 'tomato puree',
        quantity: 28,
        measure: 'ounce',
        category: 'canned vegetables',
        foodId: 'food_a9li7ueb0mw12dbnr2jlhbry5k3a'
      },
      {
        name: 'chicken stock',
        quantity: 2,
        measure: 'cup',
        category: 'canned soup',
        foodId: 'food_bptblvzambd16nbhewqmhaw1rnh5'
      },
      {
        name: 'pasta',
        quantity: 16,
        measure: 'ounce',
        category: 'grains',
        foodId: 'food_a8hs60uayl5icia1qe8qoba1kwp8'
      },
      {
        name: 'mozzarella cheese',
        quantity: 4,
        measure: 'cup',
        category: 'Cheese',
        foodId: 'food_acjhpy7bkl7a9qboztipaa2i9e4m'
      },
      {
        name: 'pepperoni',
        quantity: 6,
        measure: 'ounce',
        category: 'Cured meats',
        foodId: 'food_al5qjzna5bpefha4cy7odah0wwt2'
      }
    ],
    edamamId: '25b4dee4d738768ec944a9e1237f4bd8'
  },
  {
    name: 'Marinade for Chicken Drumsticks',
    portions: 4,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/a13/a136b5dca9ffe8658663da3d8127a4ee-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=141d09ae5aa5b9897bc0d764103ffbf9dac6e1364b66c3219e6624bebbd1e588',
    instructions:
      'http://www.edamam.com/recipe/marinade-for-chicken-drumsticks-65511d2c501e6997a58f24cec7621bd2/-',
    ingredients: [
      {
        name: 'Garlic',
        quantity: 2,
        measure: 'clove',
        category: 'vegetables',
        foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp'
      },
      {
        name: 'Olive Oil',
        quantity: 0.5,
        measure: 'cup',
        category: 'Oils',
        foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7'
      },
      {
        name: 'Cider Vinegar',
        quantity: 1,
        measure: 'bottle',
        category: 'Condiments and sauces',
        foodId: 'food_ar8m7esapmfvf8bnhfzdlabndh6v'
      },
      {
        name: 'Black Pepper',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89'
      },
      {
        name: 'Cumin',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a8jjbx4biqndasapojdb5by3e92e'
      },
      {
        name: 'Cayenne Pepper',
        quantity: 0.25,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a8iooz3aris8gba605l07brngnrx'
      },
      {
        name: 'Paprika',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a9dpcnjb883g67b3lq82ca0421ql'
      },
      {
        name: 'Sea Salt',
        quantity: 1,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a1vgrj1bs8rd1majvmd9ubz8ttkg'
      }
    ],
    edamamId: '65511d2c501e6997a58f24cec7621bd2'
  },
  {
    name: 'Chicken and Potatoes Santa Fe',
    portions: 3,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/89b/89b5916a8a57cefb3d990a9a8307e442-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=75508bb00bad03c173b54dd32cde8736feb9c591d54929c4416a9ac1e7a0d62e',
    instructions:
      'http://www.edamam.com/recipe/chicken-and-potatoes-santa-fe-03159a23d77cb6b21576d23148c6ded3/-',
    ingredients: [
      {
        name: 'Potatoes',
        quantity: 10,
        measure: 'ounce',
        category: 'vegetables',
        foodId: 'food_abiw5baauresjmb6xpap2bg3otzu'
      },
      {
        name: 'olive oil',
        quantity: 1,
        measure: 'tablespoon',
        category: 'Oils',
        foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7'
      },
      {
        name: 'Boneless, skinless chicken breasts',
        quantity: 10,
        measure: 'ounce',
        category: 'Poultry',
        foodId: 'food_bdrxu94aj3x2djbpur8dhagfhkcn'
      },
      {
        name: 'Frozen corn',
        quantity: 1,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_batr9szb8bdeqqb03sa52a0llnri'
      },
      {
        name: 'Salsa',
        quantity: 1,
        measure: 'cup',
        category: 'canned soup',
        foodId: 'food_b0t3obfawlm5k2b6erxscacez35u'
      }
    ],
    edamamId: '03159a23d77cb6b21576d23148c6ded3'
  },
  {
    name: 'Albanian Cornbread - Pite',
    portions: 8,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/eb6/eb6573126a21ce9f624de26c389f64cc-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=024200ef024b3dce63e8b4c51ea8eddc67a2151d13ce106cf25c996536c2daac',
    instructions:
      'http://www.edamam.com/recipe/albanian-cornbread-pite-69a3aa2f73da94c28cdc5d8ac6595a5f/-',
    ingredients: [
      {
        name: 'cornmeal',
        quantity: 1.5,
        measure: 'cup',
        category: 'grains',
        foodId: 'food_ab7g9h2al2pjhuakcpeqnag2jn76'
      },
      {
        name: 'cottage cheese',
        quantity: 16,
        measure: 'ounce',
        category: 'Cheese',
        foodId: 'food_adqkk4ta6dggveb3hy192aqzdfnv'
      },
      {
        name: 'eggs',
        quantity: 4,
        measure: 'unit',
        category: 'Eggs',
        foodId: 'food_bhpradua77pk16aipcvzeayg732r'
      },
      {
        name: 'scallion',
        quantity: 1,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_bknlkyzbuzo27pb11whr4bttkuy6'
      },
      {
        name: 'butter',
        quantity: 0.5,
        measure: 'cup',
        category: 'Dairy',
        foodId: 'food_awz3iefajbk1fwahq9logahmgltj'
      },
      {
        name: 'paprika',
        quantity: 0.25,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a9dpcnjb883g67b3lq82ca0421ql'
      },
      {
        name: 'dried thyme',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_avsq22zadwyb5cb5sl1byaa4mbo8'
      },
      {
        name: 'feta cheese',
        quantity: 1,
        measure: 'cup',
        category: 'Cheese',
        foodId: 'food_biry7gubtkpad3a7qkz6uba5acn9'
      },
      {
        name: 'salt',
        quantity: 0.25,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      },
      {
        name: 'scallion',
        quantity: 1,
        measure: 'tablespoon',
        category: 'vegetables',
        foodId: 'food_bknlkyzbuzo27pb11whr4bttkuy6'
      }
    ],
    edamamId: '69a3aa2f73da94c28cdc5d8ac6595a5f'
  },
  {
    name: 'Cream Cheese And Jelly Sandwich',
    portions: 6,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/f00/f00182923757e3bbbf2a21791e8440dc-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7bf49a6d6e6a50251516072eaca776645291a32b1dd2d3d461e1b63902e96eb6',
    instructions:
      'http://www.edamam.com/recipe/cream-cheese-and-jelly-sandwich-86977f1be0a58d2531477dc036827ed8/-',
    ingredients: [
      {
        name: 'jelly',
        quantity: 6,
        measure: 'ounce',
        category: 'sugar syrups',
        foodId: 'food_bzsx4atbph30cebveok2ebmgwrq8'
      },
      {
        name: 'cream cheese',
        quantity: 6,
        measure: 'ounce',
        category: 'Cheese',
        foodId: 'food_a7rvc49a09a7yjbq3ekjbbauyoqa'
      },
      {
        name: 'white bread',
        quantity: 6,
        measure: 'slice',
        category: 'bread, rolls and tortillas',
        foodId: 'food_a8uqjlbb6rdz4waxx1ucvbvotlaf'
      }
    ],
    edamamId: '86977f1be0a58d2531477dc036827ed8'
  },
  {
    name: 'Basic Roasted Acorn Squash',
    portions: 2,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/a00/a004c34474c907c045d968375f668ee1-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0cf8e9596500544118724c153dee3446d5c970be4664ee9350977f31840acc51',
    instructions:
      'http://www.edamam.com/recipe/basic-roasted-acorn-squash-9bd53d6b51ebcc69ea9fadbf907727a9/-',
    ingredients: [
      {
        name: 'acorn squash',
        quantity: 1,
        measure: 'pound',
        category: 'vegetables',
        foodId: 'food_b1a90x2by6m8pnbsdfxnmascz2tc'
      },
      {
        name: 'unsalted butter',
        quantity: 1,
        measure: 'tablespoon',
        category: 'Dairy',
        foodId: 'food_awz3iefajbk1fwahq9logahmgltj'
      },
      {
        name: 'Kosher salt',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_a1vgrj1bs8rd1majvmd9ubz8ttkg'
      },
      {
        name: 'black pepper',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89'
      },
      {
        name: 'dark brown sugar',
        quantity: 2,
        measure: 'teaspoon',
        category: 'sugars',
        foodId: 'food_aodgtqwbmeu5f6bxeffn0art3bga'
      }
    ],
    edamamId: '9bd53d6b51ebcc69ea9fadbf907727a9'
  },
  {
    name: 'Sour Cream and Bacon Potato Salad',
    portions: 20,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/85c/85cce76183038f7f504431f85283d575-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=89976ffade912b84d8257b0fcaadd71410eef24fb7f502055130dad906cfa8cd',
    instructions:
      'http://www.edamam.com/recipe/sour-cream-and-bacon-potato-salad-a4fdeeffac0ea8a2b3b46be4a9d5ad16/-',
    ingredients: [
      {
        name: 'red potato',
        quantity: 5,
        measure: 'pound',
        category: 'vegetables',
        foodId: 'food_bgf10zhacz4h7ra6e0ud1ayrtt5v'
      },
      {
        name: 'hard boiled egg',
        quantity: 6,
        measure: 'unit',
        category: 'Eggs',
        foodId: 'food_a2y52zfbr22uq1ah5thnqac607ft'
      },
      {
        name: 'bacon',
        quantity: 0.5,
        measure: 'pound',
        category: 'cured meats',
        foodId: 'food_av0awb0bgs18qub01sd9kbx44b61'
      },
      {
        name: 'parsley',
        quantity: 0.5,
        measure: 'leaf',
        category: 'vegetables',
        foodId: 'food_b244pqdazw24zobr5vqu2bf0uid8'
      },
      {
        name: 'sour cream',
        quantity: 1.5,
        measure: 'cup',
        category: 'Dairy',
        foodId: 'food_adp9fcubzl3lr7bcvzn3rbfiiiwq'
      },
      {
        name: 'mayo',
        quantity: 1.5,
        measure: 'cup',
        category: 'condiments and sauces',
        foodId: 'food_bu8t61zaplle7dbrzk81dbygq0qj'
      },
      {
        name: 'mustard',
        quantity: 3,
        measure: 'tablespoon',
        category: 'Condiments and sauces',
        foodId: 'food_a34cdj5b0kyuhfbov30xcb50u4dv'
      },
      {
        name: 'pepper sauce',
        quantity: 3.5,
        measure: 'drop',
        category: 'canned soup',
        foodId: 'food_a6201h1bu1m0tfbrvis6ma6nvhzv'
      },
      {
        name: 'salt',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      },
      {
        name: 'pepper',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89'
      }
    ],
    edamamId: 'a4fdeeffac0ea8a2b3b46be4a9d5ad16'
  },
  {
    name: 'ZUCCHINI CHICKEN BITES',
    portions: 6,
    picture_url:
      'https://edamam-product-images.s3.amazonaws.com/web-img/2ba/2ba270788865c8d53c5d5048900db2bd-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBEaCXVzLWVhc3QtMSJGMEQCIDXEwSPhxFY5YcXx0gWJtCP%2B1fJsWkq56OdZjh8KKA2kAiBGBd59L27OAQSY7q%2F2ezqOvZj0AWehKJU04hOz8S7pJCq5BQhqEAAaDDE4NzAxNzE1MDk4NiIMV5tf%2BdQRmFSoEWJZKpYFt5%2BHYfduCRWroa8b4uxE0xJLaTXyROEJ8jaFRrG5Ktu6jk%2FuvMUP2WPbmSCYqnaHj5nDsZnYqebjusTe3a5YnTdL58OR8w92UPVHWL4P7C8hglGfwee6cTZofR3bgAlvbjrbTPAYP9SmaP4xIdnuOnYf3IFb%2F9JDYDUTKQ%2FS5Sy7k0ENPTVfJ8xy7UxGDuhNm42vLZSB86YRULPWiEGcN6TOOOIjjUjDmF0B%2BHExKPB7T20qMCHeZluhiAjxM%2FgvYF19bIoZNou06iJH345PCSE4DNUIyoVFmZmgj5r1mFTreRfm35D9K1oU6lvg6NlenxjeRV51XnxnQzn6X4ShMpNikRO%2FfpTVDDMpH2AXzirUMZG8EZBP667lXUpQI%2BpQtg7aBb0Pl4yaa5GBGnHSP0HMe3CeYyP8wFskeRgUuuEFyXlwKaHwYMaEcMO96X0nc2fu9G0KpfoXvkbAD69c9Rb6mzQla8COlCg%2FAYcGlGYSkKc4f3YRykjofr7KDtRqPIU90Lht3axWJ0RAL4EKw7UQFYkb4XCNYmTcFwkI0Cvs%2B3S3v7XxuQPfyz9fnhTTBjVhReSZ5mKdnRqdfVPd7tbMV20ZL7zY%2BetnNJbJkNoqpuVzvFNjiJlVkGh%2BBxHGvO9h2wDFcZ2ZP2IIYbWtDqL%2B0gO7dQCEqYiiPKww6z3MoVqq8hMaLukfySKXFDBP9upk4drm8ImCyTgyvlNSdO%2B8sNwq5BvaKMbzBjPmOewpOJ%2B2f7JYAAxvn01dWRXllhfdk2O0pqb49Q0NTMQPwWZ6RCnSdk65Fv06RQSTosT3LL9ygQgvzX1H20cGK%2FoMO2zxJDdwCPukU%2FylajGEzym7xkDxTswkXuLHynJeV%2BzZhXMcZhIw5KW5pAY6sgF1vDVp1RPHY7m1KY6wwzzAsqnRStdMWWeDWHG2H8DHpiGm7Kb8J9ss3QZHZuT%2FDj3kH%2FeDnE0O4QDQpebeRVNxYfy0j1TjW24l1OYH%2BvE%2Bos7AB3IstvWX99mK3nTqwj7o9HLCwIiIwMG4Spg9QJYCItsheV8VOsSGjSGVuxy72WpxsK0%2BBJ3vVpemBf1KcXNd7mBk%2FVHaQ9wVJLMupq140CsMxqj1JzM8a%2BqauN4m%2Fvkp&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230618T014155Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFLYX4KAWP%2F20230618%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2717585055f67f956cc6127ef91a007b49a9640e4dc99da15c0bc3cd02b2ffa3',
    instructions:
      'http://www.edamam.com/recipe/zucchini-chicken-bites-a9c3cdc9f0ca542edcf95a277ae512ce/-',
    ingredients: [
      {
        name: 'ground chicken',
        quantity: 1,
        measure: 'pound',
        category: 'poultry',
        foodId: 'food_b4430z5avkliqsbzns6gpbhdn07c'
      },
      {
        name: 'green onion',
        quantity: 2,
        measure: 'unit',
        category: 'vegetables',
        foodId: 'food_bknlkyzbuzo27pb11whr4bttkuy6'
      },
      {
        name: 'parsley',
        quantity: 2,
        measure: 'tablespoon',
        category: 'vegetables',
        foodId: 'food_b244pqdazw24zobr5vqu2bf0uid8'
      },
      {
        name: 'garlic',
        quantity: 2,
        measure: 'clove',
        category: 'vegetables',
        foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp'
      },
      {
        name: 'zucchini',
        quantity: 2,
        measure: 'cup',
        category: 'vegetables',
        foodId: 'food_avpihljbuwpd8ibbmahcabaros5s'
      },
      {
        name: 'salt',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9'
      },
      {
        name: 'pepper',
        quantity: 1,
        measure: 'unit',
        category: 'Condiments and sauces',
        foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89'
      },
      {
        name: 'cumin',
        quantity: 0.5,
        measure: 'teaspoon',
        category: 'Condiments and sauces',
        foodId: 'food_a8jjbx4biqndasapojdb5by3e92e'
      },
      {
        name: 'olive oil',
        quantity: 2.5,
        measure: 'tablespoon',
        category: 'Oils',
        foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7'
      }
    ],
    edamamId: 'a9c3cdc9f0ca542edcf95a277ae512ce'
  }
]
