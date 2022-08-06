/*
 * ingre
 * server/models/Ingredient.js
 * This script contains the necessary code to define the Ingredient entity
 * Copyright 2022 Leo Wong
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ingredientSchema = new Schema({
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
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
