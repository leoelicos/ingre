import { Types, Schema, model, type Document } from 'mongoose'
import { IngredientSchema } from './Ingredient'
import type { CustomisationDoc } from '../schemas/types'

export interface RecipeSchema extends Document {
  _id: Types.ObjectId
  name: string
  portions: number
  ingredients: Array<Types.Subdocument & IngredientSchema> // before population
  picture_url: string
  libraryId?: string
  instructions?: string
  customisations: Array<CustomisationDoc>
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
  },
  // #182: differences from the library original, one per change
  customisations: {
    type: [
      new Schema(
        {
          kind: {
            type: String,
            required: true,
            enum: [
              'AddedIngredient',
              'RemovedIngredient',
              'ChangedIngredient',
              'PortionsChange'
            ]
          },
          ingredientId: String,
          from: Number,
          to: Number
        },
        { _id: false }
      )
    ],
    default: []
  }
})

export const Recipe = model<RecipeSchema>('Recipe', recipeSchema)
