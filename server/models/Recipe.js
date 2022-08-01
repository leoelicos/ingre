/*
 * ingre
 * server/models/Recipe.js
 * This script contains the necessary code to define the Recipe entity
 * Copyright 2022 Leo Wong
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

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
  }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
