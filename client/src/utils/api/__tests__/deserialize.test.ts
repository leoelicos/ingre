import deserialize from '../deserialize'
import type { EdamamHit } from '../../../types/edamam'

const placeholder =
  'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'

describe('deserialize', () => {
  it('handles empty response', () => {
    expect(deserialize([])).toEqual([])
  })

  it('maps a complete hit', () => {
    const hit: EdamamHit = {
      recipe: {
        uri: 'http://example.com/recipe_abc',
        label: 'Soup',
        images: { LARGE: { url: 'http://img' } },
        shareAs: 'http://share',
        yield: 4,
        ingredients: [
          { food: 'Pea', quantity: 2, measure: 'cup', foodCategory: 'veg' }
        ]
      }
    }
    expect(deserialize([hit])[0]).toMatchObject({
      name: 'Soup',
      portions: 4,
      picture_url: 'http://img',
      instructions: 'http://share',
      edamamId: 'abc',
      ingredients: [
        {
          name: 'Pea',
          quantity: 2,
          measure: 'cup',
          category: 'veg',
          _id: undefined
        }
      ]
    })
  })

  it('fills defaults when fields are missing or empty', () => {
    const hit: EdamamHit = {
      recipe: {
        label: '',
        yield: 0,
        images: {},
        ingredients: [{ food: '', quantity: 0, measure: '', foodCategory: '' }]
      }
    }
    const recipe = deserialize([hit])[0]
    expect(recipe.name).toBe('unnamed recipe')
    expect(recipe.portions).toBe(1)
    expect(recipe.picture_url).toBe(placeholder)
    expect(recipe.edamamId).toBeUndefined()
    expect(recipe.ingredients[0]).toMatchObject({
      name: 'unnamed ingredient',
      quantity: 1,
      measure: 'unit',
      category: 'unnamed category'
    })
  })

  it('uses defaults when images and ingredients are absent', () => {
    const hit: EdamamHit = { recipe: { uri: 'http://example.com/no-id' } }
    const recipe = deserialize([hit])[0]
    expect(recipe.picture_url).toBe(placeholder)
    expect(recipe.ingredients).toEqual([])
    expect(recipe.edamamId).toBeUndefined()
  })

  it('uses the placeholder when the large image has no url', () => {
    const hit: EdamamHit = { recipe: { images: { LARGE: {} }, label: 'Named' } }
    expect(deserialize([hit])[0].picture_url).toBe(placeholder)
    expect(deserialize([hit])[0].name).toBe('Named')
  })
})
