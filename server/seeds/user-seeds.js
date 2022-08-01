/*
 * ingre
 * seeds/user-seeds.js
 * This script seeds two Users
 * Copyright 2022 Leo Wong
 */

const { User, Recipe, Product, Order } = require('../models');

const getRecipeId = async (word) => {
  const recipeID = await Recipe.findOne({ name: word });
  return recipeID._id;
};

const seedUsers = async () => {
  const recipeID = await getRecipeId('Wings');
  const products = await Product.find();
  const order = await new Order({ products: [products[0]._id] }).populate('products');

  const users = await User.insertMany([
    {
      firstName: 'professional',
      lastName: 'professional',
      email: 'pro@ingre.com',
      password: 'professional',
      savedRecipes: [recipeID],
      libraryRecipes: [recipeID],
      orders: [order]
    },
    {
      firstName: 'regular',
      lastName: 'regular',
      email: 'regular@ingre.com',
      password: 'regular',
      savedRecipes: [recipeID],
      libraryRecipes: [recipeID],
      orders: []
    }
  ]);
  return users;
};

module.exports = seedUsers;
