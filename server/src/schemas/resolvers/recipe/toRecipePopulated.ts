import { Types } from 'mongoose'
import { Category, CustomisationDoc, RecipePopulated } from '../../types'

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
    ingredientId?: string | null | undefined
  }>
  customisations: ReadonlyArray<CustomisationDoc>
}

/** Copies only the amounts a change of its kind carries (#182). */
export const toCustomisation = ({
  kind,
  ingredientId,
  from,
  to
}: CustomisationDoc): CustomisationDoc => ({
  kind,
  ...(ingredientId === undefined ? {} : { ingredientId }),
  ...(from === undefined ? {} : { from }),
  ...(to === undefined ? {} : { to })
})

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
    quantity: i.quantity,
    ingredientId: i.ingredientId ?? null
  })),
  customisations: recipe.customisations.map(toCustomisation),
  ...(recipe.instructions ? { instructions: recipe.instructions } : {}),
  ...(recipe.libraryId ? { libraryId: recipe.libraryId } : {})
})
