import { NotFoundError } from '../errors'
import mongoose, { Types, Document } from 'mongoose'
import { Recipe, RecipeSchema } from '../models/Recipe'
import {
  CustomisationDoc,
  Ingredient as IngredientType
} from '../schemas/types'
import { Ingredient } from '../models/Ingredient'
import { Category } from '../models/Category'

/** Distinct category ids referenced by the given recipes' ingredients. */
export const usedCategoryIds = <Id>(
  recipes: ReadonlyArray<{
    ingredients: ReadonlyArray<{ category: { _id: Id } }>
  }>
): Id[] =>
  Array.from(
    new Set(
      recipes.flatMap(({ ingredients }) =>
        ingredients.map(({ category }) => category._id)
      )
    )
  )

/** Deletes the given ingredient documents in parallel. */
export const deleteIngredients = (
  ingredients: ReadonlyArray<{ _id: Types.ObjectId }>
) =>
  Promise.all(ingredients.map(({ _id }) => Ingredient.findByIdAndDelete(_id)))

export class RecipeApi {
  public createRecipe = async ({
    name,
    portions,
    instructions,
    ingredients,
    picture_url,
    libraryId,
    customisations = []
  }: {
    name: string
    portions: number
    instructions?: string | null | undefined
    ingredients: unknown[]
    picture_url: string
    libraryId?: string | null | undefined
    customisations?: CustomisationDoc[]
  }) => {
    const recipe = await Recipe.create({
      name,
      portions,
      instructions,
      ingredients,
      picture_url,
      libraryId,
      customisations
    })
    return await Recipe.findById(recipe._id)
      .select('-__v')
      .populate<{
        ingredients: Array<IngredientType>
      }>({
        path: 'ingredients',
        populate: { path: 'category' }
      })
      .orFail()
  }

  public getRecipe = async (_id: Types.ObjectId) => {
    return await Recipe.findById<RecipeSchema & mongoose.Document>(_id)
      .select('-__v')
      .populate<{ ingredients: Array<IngredientType> }>({
        path: 'ingredients',
        populate: { path: 'category' }
      })
  }

  public getAllRecipes = async () => {
    return await Recipe.find<RecipeSchema & Document>()
      .select('-__v')
      .populate<{
        ingredients: Array<IngredientType>
      }>({
        path: 'ingredients',
        populate: { path: 'category' }
      })
  }

  // it doesn't delete the ingredients
  // only used for testing
  public deleteAllRecipes = async () => {
    return await Recipe.deleteMany()
  }

  // static function to remove unused categories
  // public so it can be tested
  public categoryCleanup = async () => {
    const allRecipes = await Recipe.find<RecipeSchema & Document>()
      .select('-__v')
      .populate<{
        ingredients: Array<IngredientType>
      }>({
        path: 'ingredients',
        populate: { path: 'category' }
      })
    await Category.deleteMany({ _id: { $nin: usedCategoryIds(allRecipes) } })
  }

  public deleteRecipe = async ({
    recipeId
  }: {
    recipeId: mongoose.Types.ObjectId
  }) => {
    const dbRecipe =
      await Recipe.findById<RecipeSchema>(recipeId).select('-__v')
    if (!dbRecipe) throw new NotFoundError('Recipe does not exist!')
    await deleteIngredients(dbRecipe.ingredients)
    await Recipe.findByIdAndDelete(recipeId)
    await this.categoryCleanup()
  }
}
