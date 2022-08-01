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

const getProductId = async () => {
  const product = await Product.findOne({});
  return product._id;
};

const seedUsers = async () => {
  const productID = await getProductId();
  const order = new Order({ productID });

  const recipeID = await getRecipeId('Wings');

  const userData = [
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
  ];

  const user = User.insertMany(userData);
  return user;
};

module.exports = seedUsers;
