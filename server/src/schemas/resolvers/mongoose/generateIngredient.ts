import mongoose from 'mongoose';
import { Ingredient } from 'models/Ingredient';
import { IngredientInput } from 'schemas/types';
import { updateUniqueCategoryName } from './updateUniqueCategoryName';

const defaultIngredientName = 'Generic';
const defaultIngredientQuantity = 1;
const defaultIngredientMeasure = 'unit';

export const generateIngredient = async ({ ingredient, uniqueCategories }: { ingredient: IngredientInput; uniqueCategories: Array<string> }): Promise<mongoose.Types.ObjectId> => {
  try {
    const categoryId = await updateUniqueCategoryName({
      uniqueCategories: uniqueCategories,
      category: {
        name: ingredient.category || defaultIngredientName
      }
    });
    const newIngredient = {
      name: ingredient.name || defaultIngredientName,
      quantity: ingredient.quantity || defaultIngredientQuantity,
      measure: ingredient.measure || defaultIngredientMeasure,
      category: categoryId
    };
    let createdIngredient = await Ingredient.create(newIngredient);

    return createdIngredient._id;
  } catch (error) {
    throw error;
  }
};
