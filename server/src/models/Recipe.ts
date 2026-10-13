import { Types, Schema, model, type Document } from 'mongoose'
import { IngredientSchema } from './Ingredient'

export interface RecipeSchema extends Document {
  _id: Types.ObjectId
  name: string
  portions: number
  ingredients: Array<Types.Subdocument & IngredientSchema> // before population
  picture_url: string
  libraryId?: string
  instructions?: string
}

const recipeSchema = new Schema<RecipeSchema>({
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
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    }
  ],
  picture_url: {
    type: String,
    required: true
  },
  libraryId: {
    type: String,
    default: null
  },
  instructions: {
    type: String,
    default: null
  }
})

export const Recipe = model<RecipeSchema>('Recipe', recipeSchema)
