/*
 * ingre
 * seeds/category-seeds.js
 * This script seeds 5 categories
 * Copyright 2022 Leo Wong
 */

const { Category } = require('../models');

const categorySeeds = [
  //
  { name: 'Fruit and Veg' },
  { name: 'Protein' },
  { name: 'Cold' },
  { name: 'Aisle' },
  { name: 'Frozen' }
];

const seedCategories = () => Category.insertMany(categorySeeds);

module.exports = seedCategories;
