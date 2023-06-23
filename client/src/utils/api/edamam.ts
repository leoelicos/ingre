import axios from 'axios'

import {
  EdamamHit,
  EdamamRecipeSearchResponse,
  FetchEdamamOptions,
  IngreRecipe,
  SearchParams
} from './edamamTypes.ts'

const encode = ({
  q,
  diet,
  health,
  cuisineType,
  mealType,
  dishType
}: SearchParams): string => {
  /*
   * From the Edamam Docs for Recipe API:
   * Parameter q is required if no other parameter is specified
   * Parameter q is not required if any other parameter is specified
   */

  if (
    q.length === 0 &&
    diet.length === 0 &&
    health.length === 0 &&
    cuisineType.length === 0 &&
    mealType.length === 0 &&
    dishType.length === 0
  )
    return 'q=yum'

  let arr1 = q.length > 0 ? [`q=${encodeURIComponent(q)}`] : []
  let arr2 = [
    ...diet.map((v: string) => `diet=${encodeURIComponent(v)}`),
    ...health.map((v: string) => `health=${encodeURIComponent(v)}`),
    ...mealType.map((v: string) => `mealType=${encodeURIComponent(v)}`),
    ...dishType.map((v: string) => `dishType=${encodeURIComponent(v)}`),
    ...cuisineType.map((v: string) => `cuisineType=${encodeURIComponent(v)}`)
  ]

  return arr1.concat(arr2).join('&')
}

const fetchEdamam = async ({
  search,
  appId,
  appKey
}: FetchEdamamOptions): Promise<IngreRecipe[]> => {
  try {
    const {
      q = '',
      diet = [],
      health = [],
      cuisineType = [],
      mealType = [],
      dishType = []
    } = search

    let searchString = encode({
      q,
      diet,
      health,
      cuisineType,
      mealType,
      dishType
    })

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
        searchString
      ].join('&')

    const response: { status: number; data: EdamamRecipeSearchResponse } =
      await axios.get(uri)

    if (!response) throw 'Error: 404 Edamam no response'

    /* from the docs: https://developer.edamam.com/edamam-docs-recipe-api */
    if (response.status === 400) throw 'Error: 400 Edamam error'
    if (response.status === 403) throw 'Error: 403 Edamam error'
    if (response.status !== 200)
      console.info('Error: Unknown Edamam error', response.status)

    if (!response.data) throw 'Error: 404 Edamam no data'

    if (!response.data.hits) throw 'Error: 404 Edamam no hits'

    return deserialize(response.data.hits)
  } catch (err) {
    console.error(err)
    return []
  }
}

export default fetchEdamam

const deserialize = (array: EdamamHit[]) =>
  array.map((hit): IngreRecipe => {
    const { recipe, _links } = hit
    const edamamId = _links.self.href
      .split('https://api.edamam.com/api/recipes/v2/')[1]
      .split('?')[0]

    const image = recipe.images.LARGE.url
    const placeholder =
      'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
    const edamamPlaceholders = [
      'fe91e54771717b4aed8e279237b46b11',
      '323e10a433ca706efb4b22b9d8c2814e'
    ]
    const isEdamamPlaceholder = edamamPlaceholders.some((string) =>
      image.includes(string)
    )

    return {
      name: recipe.label?.trim() || '_',
      portions: recipe.yield || 1,
      picture_url: !image || isEdamamPlaceholder ? placeholder : image,
      instructions: recipe.shareAs,
      ingredients: recipe.ingredients.map((ingredient) => {
        return {
          name: ingredient.food,
          quantity: ingredient.quantity,
          measure: ingredient.measure,
          category: ingredient.foodCategory,
          foodId: ingredient.foodId
        }
      }),
      edamamId
    }
  })