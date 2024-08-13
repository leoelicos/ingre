import type { Document } from 'mongoose';
import { Category, Ingredient, Recipe, User } from 'models';
import { RecipeSchema } from 'models/Recipe';
import { Ingredient as IngredientType } from 'schemas/types';

// removes a recipe from the database
export const removeRecipe = async (_parent: any, { recipeId }: { recipeId: any }, context: any) => {
  try {
    if (!context.user) throw 'Not logged in!';
    const dbRecipe = await Recipe.findById(recipeId);
    if (!dbRecipe) throw 'Recipe does not exist!';

    // delete all ingredients in this recipe from database
    for (const { _id } of dbRecipe.ingredients) {
      await Ingredient.findByIdAndDelete(_id);
    }
    // remove all ingredient references in recipe
    await Recipe.findByIdAndUpdate(recipeId, { $set: { ingredients: [] } }, { new: true });

    // delete Recipe
    await Recipe.findByIdAndDelete(recipeId);

    // clean up categories
    const usedCategories: any = [];
    const recipes = await Recipe.find<RecipeSchema & Document>()
      .populate<{ ingredients: Array<IngredientType> }>({
        path: 'ingredients',
        populate: { path: 'category' }
      })
      .select('ingredients');

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((i) => {
        const c = i.category;
        if (!usedCategories.includes(String(c._id))) usedCategories.push(String(c._id));
      });
    });
    await Category.deleteMany({ _id: { $nin: usedCategories } });

    const user = await User.findByIdAndUpdate(context.user._id, { $pull: { savedRecipes: recipeId } }, { new: true });
    if (!user) throw 'User not found, please log in';
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
