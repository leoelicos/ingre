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

export const updateUniqueCategoryName = async ({
  category
}: {
  category: {
    name: string
  }
}) => {
  const categories = await Category.find().select('name')
  const uniqueCategories = categories.map((c) => c.name)
  if (!uniqueCategories.includes(category.name)) {
    await Category.create({ name: category.name })
    uniqueCategories.push(category.name)
  }
  return await Category.findOne({ name: category.name }).select('-__v')
}

export const generateIngredients = async ({
  ingredients
}: {
  ingredients: Array<IngredientInput>
}) =>
  Promise.all(
    ingredients.map((ingredient) => generateIngredient({ ingredient }))
  )

const defaultIngredientName = 'Generic'
const defaultIngredientQuantity = 1
const defaultIngredientMeasure = 'unit'

export const generateIngredient = async ({
  ingredient
}: {
  ingredient: IngredientInput
}) => {
  try {
    const categoryId = await updateUniqueCategoryName({
      category: {
        name: ingredient.category || defaultIngredientName
      }
    })
    const newIngredient = {
      name: ingredient.name || defaultIngredientName,
      quantity: ingredient.quantity || defaultIngredientQuantity,
      measure: ingredient.measure || defaultIngredientMeasure,
      category: categoryId
    }
    const createdIngredient = await Ingredient.create(newIngredient)
    return await Ingredient.findById(createdIngredient._id)
      .select('-__v')
      .populate({ path: 'category' })
      .orFail()
  } catch (error) {
    throw error
  }
}

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
    const usedCategories = Array.from(
      new Set(
        allRecipes.flatMap((recipe) =>
          recipe.ingredients.map((ingredient) => ingredient.category._id)
        )
      )
    )
    await Category.deleteMany({ _id: { $nin: usedCategories } })
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

    dbRecipe.set({
      name: input.name,
      portions: input.portions,
      ingredients: ingredients.map(({ _id }) => _id),
      picture_url: input.picture_url,
      libraryId: input.libraryId,
      instructions: input.instructions
    })
    await dbRecipe.save()
    await dbRecipe.populate({ path: 'ingredients', populate: 'category' })
    await this.categoryCleanup()
    return dbRecipe
  }
}
