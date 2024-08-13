import mongoose from 'mongoose';
import { Recipe } from '../../../models/Recipe';
import { Recipe as RecipeType } from 'schemas/types';

export const getRecipe = async (_: any, _id: mongoose.Types.ObjectId): Promise<RecipeType> => {
  try {
    const recipe = await Recipe.findById(_id).populate({
      path: 'ingredients',
      populate: 'category'
    });
    if (!recipe) throw new Error('could not find recipe');
    return recipe;
  } catch (error) {
    throw error;
  }
};
