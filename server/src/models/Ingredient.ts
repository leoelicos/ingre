import mongoose from 'mongoose'
import type { Document } from 'mongoose'
import { CategorySchema } from './Category'

export interface IngredientSchema extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  quantity: number
  measure: string
  text: string
  category: CategorySchema
}

const ingredientSchema = new mongoose.Schema<IngredientSchema>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  measure: {
    type: String
  },
  text: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
})

export const Ingredient = mongoose.model('Ingredient', ingredientSchema)
