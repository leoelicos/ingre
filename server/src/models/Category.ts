import { Schema, Types, model } from 'mongoose'
import type { Document } from 'mongoose'

export interface CategorySchema extends Document {
  /* 'Document' refers to a value, but is being used as a type here. Did you mean 'typeof Document'?ts(2749) */
  _id: Types.ObjectId // Cannot find namespace 'Types'.ts(2503)
  name: string
}

const categorySchema = new Schema<CategorySchema>({
  name: {
    type: String,
    required: true,
    trim: true
  }
})

export const Category = model('Category', categorySchema)
