/*
 * ingre
 * seeds/recipe-seeds.js
 * This script seeds a recipe
 * Copyright 2022 Leo Wong
 */

const { Recipe, Ingredient } = require('../models');

const getIngredientId = async (word) => {
  const ingredient = await Ingredient.findOne({ name: word });

  return ingredient._id;
};

const seedRecipes = async () => {
  const ingredientId = await getIngredientId('chicken wings');

  const recipeSeeds = [
    {
      name: 'Wings',
      portions: 2,
      ingredients: [ingredientId],
      picture_url: 'https://photos.bigoven.com/recipe/hero/spicy-baked-chicken-wings-00e568.jpg?h=300&w=300'
    }
  ];

  const recipe = Recipe.insertMany(recipeSeeds);
  return recipe;
};

module.exports = seedRecipes;
