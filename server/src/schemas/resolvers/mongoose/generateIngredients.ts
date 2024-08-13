import mongoose from 'mongoose';
import { IngredientInput } from 'schemas/types';
import { generateIngredient } from './generateIngredient';

export const generateIngredients = async ({ ingredients, uniqueCategories }: { ingredients: Array<IngredientInput>; uniqueCategories: Array<string> }): Promise<Array<mongoose.Types.ObjectId>> => {
  try {
    const generatedIngredientArrays = await Promise.all(ingredients.map((ingredient) => generateIngredient({ ingredient, uniqueCategories })));
    const response: Array<mongoose.Types.ObjectId> = generatedIngredientArrays.filter((array) => array !== null) as Array<mongoose.Types.ObjectId>;
    return response;
  } catch (error) {
    throw error;
  }
};
