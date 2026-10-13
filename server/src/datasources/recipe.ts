import { NotFoundError } from '../errors'
import mongoose, { Types, Document } from 'mongoose'
import { Recipe, RecipeSchema } from '../models/Recipe'
import {
  IngredientInput,
  Ingredient as IngredientType,
  RecipeInput
} from '../schemas/types'
import { Ingredient } from '../models/Ingredient'
import { Category } from '../models/Category'
import { withIngredientDefaults } from '../utils/ingredientDefaults'

/** Returns the category with this name, creating it first if missing. */
export const updateUniqueCategoryName = async ({
  category: { name }
}: {
  category: { name: string }
}) => {
  const exists = await Category.exists({ name })
  if (!exists) await Category.create({ name })
  return await Category.findOne({ name }).select('-__v')
}

export const generateIngredients = async ({
  ingredients
}: {
  ingredients: Array<IngredientInput>
}) =>
  Promise.all(
    ingredients.map((ingredient) => generateIngredient({ ingredient }))
  )

export const generateIngredient = async ({
  ingredient
}: {
  ingredient: IngredientInput
}) => {
  const { category, ...fields } = withIngredientDefaults(ingredient)
  const categoryDoc = await updateUniqueCategoryName({
    category: { name: category }
  })
  const created = await Ingredient.create({ ...fields, category: categoryDoc })
  return await Ingredient.findById(created._id)
    .select('-__v')
    .populate({ path: 'category' })
    .orFail()
}

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

/** Recipe fields to store on update, given the new ingredient ids. */
export const toRecipeUpdate = <Id>(
  input: RecipeInput,
  ingredientIds: Id[]
) => ({
  name: input.name,
  portions: input.portions,
  ingredients: ingredientIds,
  picture_url: input.picture_url,
  libraryId: input.libraryId,
  instructions: input.instructions
})

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
    libraryId
  }: {
    name: string
    portions: number
    instructions?: string | null | undefined
    ingredients: unknown[]
    picture_url: string
    libraryId?: string | null | undefined
  }) => {
    const recipe = await Recipe.create({
      name,
      portions,
      instructions,
      ingredients,
      picture_url,
      libraryId
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

  /** Replaces a recipe's fields and ingredients; returns null when the recipe does not exist. */
  public updateRecipe = async ({
    recipeId,
    input
  }: {
    recipeId: mongoose.Types.ObjectId
    input: RecipeInput
  }) => {
    const dbRecipe =
      await Recipe.findById<RecipeSchema>(recipeId).select('-__v')
    if (!dbRecipe) return null

    await deleteIngredients(dbRecipe.ingredients)
    const ingredients = await generateIngredients({
      ingredients: input.ingredients
    })

    dbRecipe.set(
      toRecipeUpdate(
        input,
        ingredients.map(({ _id }) => _id)
      )
    )
    await dbRecipe.save()
    await dbRecipe.populate({ path: 'ingredients', populate: 'category' })
    await this.categoryCleanup()
    return dbRecipe
  }
}
