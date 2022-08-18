/*
 * ingre
 * seeds/index.js
 * This script seeds the database with ingredients, recipes, users, categories and products
 * Copyright 2022 Leo Wong
 */

const db = require('../config/connection');
const { User, Recipe, Ingredient, Category } = require('../models');

const seedUsers = require('./user-seeds');

// open database
db.once('open', async () => {
  await Category.deleteMany();
  await Ingredient.deleteMany();
  await Recipe.deleteMany();
  await User.deleteMany();
  console.log('Reset database.');

  await seedUsers();
  console.log('Seeded database.');

  process.exit(0);
});
