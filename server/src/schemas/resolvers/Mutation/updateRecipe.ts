import mongoose from 'mongoose';
import type { Document } from 'mongoose';
import { Category, Ingredient, Recipe } from 'models';
import { RecipeInput, Ingredient as IngredientType } from 'schemas/types';
import { generateIngredients } from 'schemas/resolvers/mongoose/generateIngredients';
import { getUniqueCategoryNames } from 'schemas/resolvers/mongoose/getUniqueCategoryNames';
import { RecipeSchema } from 'models/Recipe';

export const updateRecipe = async (_parent: any, recipeId: mongoose.Types.ObjectId, input: RecipeInput, context: any) => {
  try {
    if (!context.user) throw 'Not logged in!';
    const dbRecipe = await Recipe.findById<RecipeSchema>(recipeId);
    if (!dbRecipe) throw 'Recipe does not exist!';

    // remove existing ingredients
    for (const { _id } of dbRecipe.ingredients) {
      await Ingredient.findByIdAndDelete<IngredientType>(_id);
    }

    // reset ingredients in recipe
    dbRecipe.ingredients = [];

    // Generate new ingredients
    const uniqueCategories = await getUniqueCategoryNames();
    const generatedIngredients: Array<mongoose.Types.ObjectId> = await generateIngredients({
      ingredients: input.ingredients,
      uniqueCategories
    });

    // assign updated values to the recipe
    dbRecipe.name = input.name;
    dbRecipe.portions = input.portions;
    dbRecipe.ingredients = generatedIngredients;
    dbRecipe.picture_url = input.picture_url || 'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc';
    dbRecipe.edamamId = input.edamamId;
    dbRecipe.instructions = input.instructions;
    await dbRecipe.save();

    // populate ingredients with categories
    await dbRecipe.populate({ path: 'ingredients', populate: 'category' });

    // Handle category clean-up
    const usedCategories: Array<mongoose.Types.ObjectId> = [];
    const allRecipes = await Recipe.find<RecipeSchema & Document>()
      .populate<{ ingredients: Array<IngredientType> }>({
        path: 'ingredients',
        populate: { path: 'category' }
      })
      .select('ingredients');

    allRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((i) => {
        const c = i.category; // Property 'category' does not exist on type 'ObjectId'.ts(2339)
        if (!usedCategories.includes(c._id)) usedCategories.push(c._id);
      });
    });
    await Category.deleteMany({ _id: { $nin: usedCategories } });
    return dbRecipe;
  } catch (error) {
    console.error(error);
  }
};
