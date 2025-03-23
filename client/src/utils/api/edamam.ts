import axios from 'axios'

import type {
  EdamamRecipeSearchResponse,
  FetchEdamamOptions
} from 'types/edamam'
import type { ClientRecipe } from 'types/client'
import encode from './encode'
import deserialize from './deserialize'
import { mockResponse } from './mockResponse'

type FetchEdamamType = ({
  search,
  appId,
  appKey
}: FetchEdamamOptions) => Promise<ClientRecipe[]>

const fetchEdamam: FetchEdamamType = async ({ search, appId, appKey }) => {
  const { q, diet, health, cuisineType, mealType, dishType } = search
  try {
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
        'field=uri',
        'field=label',
        'field=image',
        'field=images',
        'field=yield',
        'field=ingredients',
        'field=shareAs',
        searchString
      ].join('&')

    // const response: { status: number; data: EdamamRecipeSearchResponse } = await axios.get(uri)
    const response = { status: 200, data: mockResponse }
    if (!response) throw new Error('Error: 404 Edamam no response')

    /* from the docs: https://developer.edamam.com/edamam-docs-recipe-api */
    if (response.status === 400) throw new Error('Error: 400 Edamam error')
    if (response.status === 403) throw new Error('Error: 403 Edamam error')
    if (response.status !== 200)
      console.info('Error: Unknown Edamam error', response.status)

    if (!response.data) throw new Error('Error: 404 Edamam no data')

    if (!response.data.hits) throw new Error('Error: 404 Edamam no hits')

    return deserialize(response.data.hits)
  } catch (err) {
    console.error(err)
    return []
  }
}

export default fetchEdamam
