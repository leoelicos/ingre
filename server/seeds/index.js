/*
 * ingre
 * seeds/index.js
 * This script seeds the database with ingredients, recipes, users, categories and products
 * Copyright 2022 Leo Wong
 */

const db = require('../config/connection');
const { User, Recipe, Ingredient, Category, Product } = require('../models');

const seedCategories = require('./category-seeds');
const seedIngredients = require('./ingredient-seeds');
const seedProducts = require('./product-seeds');
const seedRecipes = require('./recipe-seeds');
const seedUsers = require('./user-seeds');

// open database
db.once('open', async () => {
  // delete database
  await Category.deleteMany();
  await Ingredient.deleteMany();
  await Product.deleteMany();
  await Recipe.deleteMany();
  await User.deleteMany();

  console.log('Seeding database…');

  // seed database
  await seedCategories();
  await seedIngredients();
  await seedProducts();
  await seedRecipes();
  await seedUsers();

  console.log('Seeding finished.');

  // exit runtime
  process.exit(0);
});
