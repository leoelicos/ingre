const mongoose = require('mongoose')

const { Schema } = mongoose

const recipeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  portions: {
    type: Number,
    required: true,
    min: 0,
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
  edamamId: {
    type: String
  },
  instructions: {
    type: String
  }
})

const Recipe = mongoose.model('Recipe', recipeSchema)

module.exports = Recipe
