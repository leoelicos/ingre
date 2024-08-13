import db from '../config/connection';
import { User, Recipe, Ingredient, Category } from '../src/models';

const seedUsers = require('./user-seeds');

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
