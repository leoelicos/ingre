/*
 * ingre
 * server/models/Category.js
 * This script contains the necessary code to define the Category entity
 * Copyright 2022 Leo Wong
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
