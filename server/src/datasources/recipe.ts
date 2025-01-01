import mongoose, { Types } from 'mongoose'
import { Recipe, RecipeSchema } from 'models/Recipe'
import {
  IngredientInput,
  Ingredient as IngredientType,
  RecipeInput
} from 'schemas/types'
import { Ingredient, IngredientSchema } from 'models/Ingredient'
import { Category } from 'models/Category'

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
}): Promise<Array<Types.Subdocument<any> & IngredientSchema>> => {
  try {
    const generatedIngredientArrays = await Promise.all(
      ingredients.map((ingredient) => generateIngredient({ ingredient }))
    )
    return generatedIngredientArrays as Array<
      Types.Subdocument<any> & IngredientSchema
    >
  } catch (error) {
    throw error
  }
}

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
  } catch (error) {
    throw error
  }
}

export class RecipeApi {
  public createRecipe = async ({
    name,
    portions,
    instructions,
    ingredients,
    picture_url,
    edamamId
  }: {
    name: string
    portions: number
    instructions: string
    ingredients: any
    picture_url: string
    edamamId: string
  }) => {
    const recipe = await Recipe.create({
      name,
      portions,
      instructions,
      ingredients,
      picture_url,
      edamamId
    })
    return await Recipe.findById(recipe._id)
      .select('-__v')
      .populate<{
        ingredients: Array<IngredientType>
      }>({
        path: 'ingredients',
        populate: { path: 'category' }
      })
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

    if (!dbRecipe) throw new Error('Recipe does not exist!') // test

    // remove existing ingredients
    for (const { _id } of dbRecipe.ingredients) {
      await Ingredient.findByIdAndDelete<IngredientType>(_id).select('-__v')
    }

    await Recipe.findByIdAndDelete(recipeId)

    await this.categoryCleanup()
  }

  public updateRecipe = async ({
    recipeId,
    input
  }: {
    recipeId: mongoose.Types.ObjectId
    input: RecipeInput
  }) => {
    try {
      const dbRecipe =
        await Recipe.findById<RecipeSchema>(recipeId).select('-__v')

      if (dbRecipe) {
        // remove existing ingredients
        for (const { _id } of dbRecipe.ingredients) {
          await Ingredient.findByIdAndDelete<IngredientType>(_id).select('-__v')
        }

        // Generate new ingredients
        const generatedIngredients: Array<
          Types.Subdocument<any> & IngredientSchema
        > = await generateIngredients({
          ingredients: input.ingredients
        })

        // assign updated values to the recipe
        dbRecipe.name = input.name
        dbRecipe.portions = input.portions
        dbRecipe.ingredients = generatedIngredients
        dbRecipe.picture_url = input.picture_url
        dbRecipe.edamamId = input.edamamId
        dbRecipe.instructions = input.instructions
        await dbRecipe.save()
        await dbRecipe.populate({ path: 'ingredients', populate: 'category' })

        await this.categoryCleanup()
        return dbRecipe
      }
    } catch (error) {
      throw error
    }
  }
}
