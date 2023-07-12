import type { EdamamHit } from '../../@types/edamam.d.ts'
import type { RecipeType } from '../../@types/recipe.d.ts'

const deserialize = (array: EdamamHit[]) =>
  array.map((hit): RecipeType => {
    console.log({ hit })
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
          category: { name: ingredient.foodCategory }
        }
      }),
      edamamId
    }
  })

export default deserialize
