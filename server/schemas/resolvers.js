/*
 * ingre
 * server/schemas/resolvers.js
 * This script contains resolvers for graphQL schema
 * Copyright 2022 Leo Wong
 */
require('dotenv').config({ path: '../.env' });
const { AuthenticationError } = require('apollo-server-express');
const { User, Recipe, Ingredient, Category } = require('../models');
const { signToken } = require('../utils/auth');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const APP_KEY = process.env.HEROKU_EDAMAM_APP_KEY || process.env.PRODUCTION_EDAMAM_APP_KEY;
const APP_ID = process.env.HEROKU_EDAMAM_APP_ID || process.env.PRODUCTION_EDAMAM_APP_ID;

const resolvers = {
  Query: {
    getUserWithEmail: async (_, args) => {
      console.log('[getUserWithEmail] REQ\t', args);
      let user = null;
      try {
        user = await User.findOne({ email: args.email });
      } catch (error) {
        console.error(error);
      }
      return user;
    },
    //
    getApiKey: () => ({ appId: APP_ID, appKey: APP_KEY }),
    //
    getUser: async (_, __, context) => {
      console.log('[getUser] REQ\t', JSON.stringify(Object.values(context.user)));
      let user = null;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');

        user = await User.findById(context.user._id);
        console.log('[getUser] user\t', user);
        if (!user) throw new Error('Please log in');
        payload = user;
      } catch (error) {
        console.error(error);
        payload = null;
      } finally {
        console.log('[getUser] payload\t', JSON.stringify(payload));
        return payload;
      }
    },

    //
    getRecipe: async (_, { _id }) => {
      console.log('[getRecipe] REQ\t', _id);
      let recipe = null;
      try {
        recipe = await Recipe.findById(_id).populate({ path: 'ingredients', populate: 'category' });
        return recipe;
      } catch (error) {
        console.error(error);
      }
      console.log('[getRecipe] payload\t', recipe);
      return recipe;
    },

    //
    getSavedRecipes: async (_, __, context) => {
      console.log('[getSavedRecipes] CTX\t', JSON.stringify(context.user));
      let payload;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');
        const user = await User.findById(context.user._id).populate({ path: 'savedRecipes' });
        console.log('[getSavedRecipes] user\t', JSON.stringify(user));
        if (!user.pro) throw new Error('User is not pro!');
        payload = user.savedRecipes;
      } catch (e) {
        console.error(e);
        payload = [];
      } finally {
        console.log('[getSavedRecipes] payload\t', JSON.stringify(payload));
        return payload;
      }
    },

    //
    checkout: async (_, args, context) => {
      console.log('[checkout]');
      let error = '';
      let id = '';
      try {
        const url = context?.headers?.referer ? new URL(context.headers.referer).origin : 'https://localhost:3000';

        // array to store product metadata in Stripe
        const line_items = [];

        const product = await stripe.products.create({
          name: 'ingre Pro',
          description: 'Permanently save your recipes to Library',
          images: [`${url}/cookie-tin.jpg`]
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 500,
          currency: 'usd'
        });

        line_items.push({ price: price.id, quantity: 1 });

        ({ id } = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${url}/`
        }));
      } catch (e) {
        error = e;
        console.log(e);
      }
      return { session: id, error };
    },
    getCategories: async () => await Category.find(),
    getIngredients: async () => await Ingredient.find().populate('category'),
    getRecipes: async () => await Recipe.find().populate({ path: 'ingredients', populate: 'category' })
    //
  },
  Mutation: {
    // adds a user to the database
    addUser: async (_, { input }) => {
      console.log('[addUser]');
      let user;
      let token;
      try {
        user = await User.create({ ...input });
        user.save();
        token = signToken(user);
      } catch (e) {
        console.error(e);
      }
      return { token, user };
    },

    // makes a user pro
    makeUserPro: async (_, __, context) => {
      console.log('[makeUserPro] CTX\t', JSON.stringify(context.user));
      let user = false;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');
        user = await User
          //
          .findByIdAndUpdate(context.user._id, { $set: { pro: true } }, { new: true })
          .select('pro');

        pro = true;
      } catch (error) {
        console.error(error);
      }
      console.log('[makeUserPro] payload\t', user);
      return user;
    },

    // saves a recipe to the database
    saveRecipe: async (_, { input: { name, portions, ingredients, picture_url } }, context) => {
      console.log('[saveRecipe] REQ\t', JSON.stringify({ name, portions, ingredients, picture_url }));
      let payload = null;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');
        const uniqueCategories = await Category
          //
          .find()
          .select('-_id name')
          .then((categories) => categories.map((c) => c.name));

        const createdIngredients = [];
        for (let { name, quantity, measure, category } of ingredients) {
          console.log('[saveRecipe] req Ing\t', name, quantity, measure, category);
          if (!name) name = 'Generic';
          if (!quantity) quantity = 1;
          if (!measure) measure = 'unit';
          if (!category) category = 'Generic';

          // find or create category
          let categoryId;
          if (!uniqueCategories.includes(category)) {
            uniqueCategories.push(category);
            let createdCategory = await Category.create({ name: category });
            createdCategory.save();
            console.log('[saveRecipe] req Cat\t', JSON.stringify(createdCategory));
            categoryId = createdCategory._id;
          } else {
            let foundCategory = await Category.findOne({ name: category });
            console.log('[saveRecipe] found Cat\t', JSON.stringify(foundCategory));
            categoryId = foundCategory._id;
          }

          // create ingredient
          let ingredient = await Ingredient.create({ name, quantity, measure, category: categoryId });
          ingredient.save();
          const ingredientId = ingredient._id;

          createdIngredients.push(ingredientId);
        }
        // create recipe
        const createdImage = 'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc';
        const recipe = await Recipe
          //
          .create({ name, portions, ingredients: createdIngredients, picture_url: picture_url || createdImage })
          .then((recipe) => recipe.populate({ path: 'ingredients', populate: 'category' }));

        // push recipe to user.savedRecipes
        const query = context.user._id;
        const update = { $push: { savedRecipes: recipe._id } };
        const user = await User.findByIdAndUpdate(query, update);
        payload = recipe;
      } catch (error) {
        console.log(error);
      }
      console.log('[saveRecipe] payload\t', JSON.stringify(payload));
      return payload;
    },

    // updates a recipe in the database
    updateRecipe: async (_, { recipeId, input: { name, portions, picture_url, ingredients } }, context) => {
      console.log('[updateRecipe] REQ\t', recipeId, JSON.stringify({ name, portions, picture_url, ingredients }));
      let dbRecipe = null;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');

        const dbRecipe = await Recipe.findById(recipeId);
        if (!dbRecipe) throw new Error('Recipe does not exist!');
        console.log('[updateRecipe] db Rec\t', JSON.stringify(dbRecipe));
        // delete all ingredients in this recipe from database
        for (const { _id } of dbRecipe.ingredients) {
          const deleteResult = await Ingredient.findByIdAndDelete(_id);
          console.log('[updateRecipe] del Ing\t', JSON.stringify(deleteResult));
        }
        // remove all ingredient references in recipe
        const clearedRecipe = await Recipe.findByIdAndUpdate(recipeId, { $set: { ingredients: [] } }, { new: true });
        console.log('[updateRecipe] upd Rec\t', JSON.stringify(clearedRecipe));

        const uniqueCategories = await Category
          //
          .find()
          .select('-_id name')
          .then((categories) => categories.map((c) => c.name));
        console.log('[updateRecipe] DB Cat\t', JSON.stringify(uniqueCategories));

        const createdIngredients = [];
        for (let { name, quantity, measure, category } of ingredients) {
          console.log('[updateRecipe] REQ Ing\t', JSON.stringify({ name, quantity, measure, category }));

          if (!name) name = 'Generic';
          if (!quantity) quantity = 1;
          if (!measure) measure = 'unit';
          if (!category) category = 'Generic';

          // find or create category
          let categoryId;
          if (!uniqueCategories.includes(category)) {
            uniqueCategories.push(category);
            let createdCategory = await Category.create({ name: category });
            createdCategory.save();
            console.log('[updateRecipe] created\t', JSON.stringify(createdCategory));
            categoryId = createdCategory._id;
          } else {
            let foundCategory = await Category.findOne({ name: category });
            console.log('[updateRecipe] found \t', JSON.stringify(foundCategory));
            categoryId = foundCategory._id;
          }

          // create ingredient
          let createdIngredient = await Ingredient.create({
            name,
            quantity,
            measure,
            category: categoryId
            //
          });
          createdIngredient.save();
          console.log('[updateRecipe] payload\t', JSON.stringify(createdIngredient));
          createdIngredients.push(createdIngredient._id);
        }
        /* 
        update recipe 
        */
        const createdImage = 'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc';
        dbRecipe.name = name;
        dbRecipe.portions = portions;
        dbRecipe.ingredients = createdIngredients;
        dbRecipe.picture_url = picture_url || createdImage;
        await dbRecipe.save();
        dbRecipe.populate({ path: 'ingredients', populate: 'category' });

        // clean up categories
        const usedCategories = [];
        await Recipe.find()
          .populate({ path: 'ingredients', populate: 'category' })
          .select('ingredients')
          .then((recipes) => {
            recipes.forEach((recipe) => {
              recipe.ingredients.forEach((i) => {
                const c = i.category;
                if (!usedCategories.includes(c._id)) usedCategories.push(c._id);
              });
            });
          });
        console.log('[updateRecipe] used Cat\t', JSON.stringify(usedCategories));
        const allCategories = await Category.find()
          .select('_id')
          .then((arr) => arr.map((val) => val._id));
        console.log('[updateRecipe] all Cat\t', JSON.stringify(allCategories));

        const result = await Category.deleteMany({ _id: { $nin: usedCategories } });
        console.log('[updateRecipe] del Cat\t', result);
        console.log('[updateRecipe] payload\t', JSON.stringify(dbRecipe));
        return dbRecipe;
      } catch (error) {
        console.error(error);
      }
    },

    // removes a recipe from the database
    removeRecipe: async (_, { recipeId }, context) => {
      console.log('[removeRecipe] REQ id\t', recipeId);
      let payload = null;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');
        const dbRecipe = await Recipe.findById(recipeId);
        if (!dbRecipe) throw new Error('Recipe does not exist!');
        console.log('[removeRecipe] db Rec\t', JSON.stringify(dbRecipe));
        // delete all ingredients in this recipe from database
        for (const { _id } of dbRecipe.ingredients) {
          const deleteResult = await Ingredient.findByIdAndDelete(_id);
          console.log('[removeRecipe] del Ing\t', JSON.stringify(deleteResult));
        }
        // remove all ingredient references in recipe
        const clearedRecipe = await Recipe.findByIdAndUpdate(recipeId, { $set: { ingredients: [] } }, { new: true });
        console.log('[removeRecipe] upd Rec\t', JSON.stringify(clearedRecipe));

        // delete Recipe
        const delRecipe = await Recipe.findByIdAndDelete(recipeId);
        console.log('[removeRecipe] del rec\t', JSON.stringify(delRecipe));

        // clean up categories
        const usedCategories = [];
        await Recipe.find()
          .populate({ path: 'ingredients', populate: 'category' })
          .select('ingredients')
          .then((recipes) => {
            recipes.forEach((recipe) => {
              recipe.ingredients.forEach((i) => {
                const c = i.category;
                if (!usedCategories.includes(c._id)) usedCategories.push(c._id);
              });
            });
          });
        console.log('[removeRecipe] used Cat\t', JSON.stringify(usedCategories));
        const allCategories = await Category.find()
          .select('_id')
          .then((arr) => arr.map((val) => val._id));
        console.log('[removeRecipe] all Cat\t', JSON.stringify(allCategories));

        const result = await Category.deleteMany({ _id: { $nin: usedCategories } });
        console.log('[removeRecipe] del Cat\t', result);

        // remove recipe from user.savedRecipes
        const query = context.user._id;
        const update = { $pull: { savedRecipes: recipeId } };
        const options = { new: true };
        const user = await User.findByIdAndDelete(query, update, options);
        payload = user;
      } catch (error) {
        console.error(error);
      } finally {
        console.log('[removeRecipe] payload\t', payload);
        return payload;
      }
    },

    //
    login: async (_, { email, password }) => {
      console.log('[login] REQ\t', JSON.stringify({ email, password }));

      const user = await User.findOne({ email });
      console.log('[login] user\t', JSON.stringify(user));

      if (!user) throw new AuthenticationError('Incorrect credentials!');
      console.log('[login] Correct credentials\t');

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) throw new AuthenticationError('Incorrect credentials!');
      console.log('[login] Correct password\t');

      const token = signToken(user);
      console.log('[login] token\t', token);

      const payload = { token, user };
      console.log('[login] payload\t', JSON.stringify(payload));
      return payload;
    }
  }
};

module.exports = resolvers;
