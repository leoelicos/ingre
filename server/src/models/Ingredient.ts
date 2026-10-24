import mongoose, { type Document } from 'mongoose'
import { CategorySchema } from './Category'

export interface IngredientSchema extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  quantity: number
  measure: string
  text: string
  ingredientId?: string | null
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
    type: String,
    required: true,
    default: 'unit'
  },
  text: {
    type: String
  },
  // #182: catalogue id, so a saved recipe can be matched to the library
  ingredientId: {
    type: String,
    default: null
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
})

export const Ingredient = mongoose.model('Ingredient', ingredientSchema)
