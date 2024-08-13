import mongoose from 'mongoose';
import type { Document } from 'mongoose';

export interface RecipeSchema extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  portions: number;
  ingredients: Array<mongoose.Types.ObjectId>; // Array of ObjectId references to Ingredients
  picture_url: string;
  edamamId?: string;
  instructions?: string;
}

const recipeSchema = new mongoose.Schema<RecipeSchema>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  portions: {
    type: Number,
    required: true,
    min: 1,
    default: 2
  },

  ingredients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    }
  ],
  picture_url: {
    type: String,
    required: true
  },
  edamamId: {
    type: String,
    default: null
  },
  instructions: {
    type: String,
    default: null
  }
});

export const Recipe = mongoose.model<RecipeSchema>('Recipe', recipeSchema);
