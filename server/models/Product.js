/*
 * ingre
 * server/models/Product.js
 * This script contains the necessary code to define the Product entity
 * Copyright 2022 Leo Wong
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    min: 0.99
  },
  quantity: {
    type: Number,
    min: 0,
    default: 0
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
