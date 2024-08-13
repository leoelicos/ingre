import { Recipe, User, Category, Ingredient } from 'models';
import { getUniqueCategoryNames } from 'schemas/resolvers/mongoose/getUniqueCategoryNames';
import { RecipeInput } from 'schemas/types';
import { RecipeSchema } from 'models/Recipe';

export const getCreatedIngredients = async ({ ingredients, uniqueCategories }: { ingredients: any; uniqueCategories: any }): Promise<Array<string>> => {
  try {
    const createdIngredients: Array<string> = [];
    for (let { name, quantity, measure, category } of ingredients) {
      if (!name) name = 'Generic';
      if (!quantity) quantity = 1;
      if (!measure) measure = 'unit';
      if (!category.name) category = 'Generic';

      // find or create category
      let categoryId;
      if (!uniqueCategories.includes(category)) {
        uniqueCategories.push(category);
        // new category to create
        let createdCategory = await Category.create({ name: category });
        createdCategory.save();
        categoryId = createdCategory._id;
      } else {
        let foundCategory = await Category.findOne({ name: category });
        if (!foundCategory) throw 'category not found';
        categoryId = foundCategory._id;
      }

      // create ingredient
      let ingredient = await Ingredient.create({ name, quantity, measure, category: { _id: categoryId } });
      ingredient.save();

      createdIngredients.push(String(ingredient._id));
    }
    return createdIngredients;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// saves a recipe to the database
export const saveRecipe = async (_: any, input: RecipeInput, context: { user: any }): Promise<RecipeSchema> => {
  try {
    if (!context.user) throw 'Not logged in!';
    const { name, portions, ingredients, picture_url, edamamId, instructions } = input;
    const uniqueCategories = await getUniqueCategoryNames();
    const createdIngredients = await getCreatedIngredients({ ingredients, uniqueCategories });
    const newRecipe = {
      name,
      portions,
      instructions,
      ingredients: createdIngredients,
      picture_url: picture_url || 'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc',
      edamamId: edamamId
    };
    const recipe = await Recipe.create(newRecipe);
    await recipe.populate({
      path: 'ingredients',
      populate: 'category'
    });

    // push recipe to user.savedRecipes
    const query = context.user._id;
    if (!query) throw 'No user found';
    const update = { $push: { savedRecipes: recipe._id } };
    const user = await User.findByIdAndUpdate(query, update, { new: true });
    if (!user) throw 'User not found, please log in';
    return recipe;
  } catch (error) {
    throw error;
  }
};
