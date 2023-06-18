import axios from 'axios'
import mockData from './mockData.js'

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
