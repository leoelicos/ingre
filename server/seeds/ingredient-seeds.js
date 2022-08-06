/*
 * ingre
 * seeds/ingredient-seeds.js
 * This script seeds an ingredient
 * Copyright 2022 Leo Wong
 */

const { Category, Ingredient } = require('../models');

const getCategoryId = async (word) => {
  const category = await Category.findOne({ name: word });
  // console.log('category is ', category);
  return category._id;
};

const seedIngredients = async () => {
  const proteinId = await getCategoryId('Protein');
  // console.log('proteinId = ', proteinId);
  const ingredientData = [
    {
      name: 'chicken wings',
      quantity: '1',
      measure: 'kg',
      text: '1kg chicken wings',
      category: proteinId
    }
  ];

  const ingredient = Ingredient.insertMany(ingredientData);
  return ingredient;
};

module.exports = seedIngredients;
