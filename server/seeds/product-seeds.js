/*
 * ingre
 * server/seeds/product-seeds.js
 * This script seeds a product that allows the user to save recipes to library
 * Copyright 2022 Leo Wong
 */

const { Product } = require('../models');

const productSeed =
  //
  {
    name: 'IngrePRO',
    description: 'Permanently save your recipes to Library',
    image: 'cookie-tin.jpg',
    price: 5.0,
    quantity: 1
  };
const seedProducts = () => Product.create(productSeed);

module.exports = seedProducts;
