import { Types } from 'mongoose'
import { Category, RecipePopulated } from '../../types'

type RecipeLike = {
  _id: Types.ObjectId
  name: string
  portions: number
  picture_url: string
  instructions?: string | null | undefined
  libraryId?: string | null | undefined
  ingredients: Array<{
    _id: Types.ObjectId
    name: string
    quantity: number
    measure: string
    category: Category
  }>
}

/** Maps a populated recipe document to the GraphQL shape, omitting empty optional fields. */
export const toRecipePopulated = (recipe: RecipeLike): RecipePopulated => ({
  _id: recipe._id,
  name: recipe.name,
  portions: recipe.portions,
  picture_url: recipe.picture_url,
  ingredients: recipe.ingredients.map((i) => ({
    _id: i._id,
    category: i.category,
    measure: i.measure,
    name: i.name,
    quantity: i.quantity
  })),
  ...(recipe.instructions ? { instructions: recipe.instructions } : {}),
  ...(recipe.libraryId ? { libraryId: recipe.libraryId } : {})
})
