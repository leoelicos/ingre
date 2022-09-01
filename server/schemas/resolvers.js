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
let payload;
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
      let user = null;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');
        user = await User.findById(context.user._id);
        if (!user) throw new Error('Please log in');
        payload = user;
      } catch (error) {
        console.error(error);
        payload = null;
      } finally {
        console.log('[getUser] payload\t', payload);
        return payload;
      }
    },

    //
    getRecipe: async (_, args) => {
      const { _id } = args;
      console.log('[getRecipe] _id', _id);
      let recipe = null;
      try {
        recipe = await Recipe.findById(_id).populate({ path: 'ingredients', populate: 'category' });
        payload = recipe;
        console.log('[getRecipe] payload\t', payload);
        return payload;
      } catch (error) {
        console.error(error);
      }
    },

    //
    getSavedRecipes: async (_, __, context) => {
      try {
        console.log('[getSavedRecipes]');
        if (!context.user) throw new AuthenticationError('Not logged in!');
        const user = await User.findById(context.user._id).populate({ path: 'savedRecipes' });
        if (!user) throw new Error('User not found, please log in');
        payload = user.savedRecipes;
      } catch (e) {
        console.error(e);
        payload = [];
      } finally {
        console.log('[getSavedRecipes] payload\t', payload);
        return payload;
      }
    },

    //
    getNumSavedRecipes: async (_, __, context) => {
      payload = 0;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');
        const user = await User.findById(context.user._id);
        if (!user) throw new Error('User not found, please log in');
        payload = user.savedRecipes.length;
      } catch (e) {
        console.error(e);
      } finally {
        // console.log('[getNumSavedRecipes] payload\t', payload);
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
    }

    /* generateSavedIngredients: async (_, __, context) => {
      try {
        console.log('[generateSavedIngredients]');
        if (!context.user) throw new AuthenticationError('Not logged in!');
        const user = await User
          //
          .findById(context.user._id)
          .populate({
            path: 'savedRecipes',
            populate: {
              path: 'ingredients',
              populate: 'category'
            }
          });
        if (!user) throw new Error('User not found, please log in');

        const savedIngredients = [];
        for (const recipe of user.savedRecipes) {
          for (const ingredient of recipe.ingredients) {
            const { _id, name, quantity, measure, category } = ingredient;
            const savedIngredient = { _id, name, quantity, measure, category: category.name, recipe: recipe.name, recipeId: recipe._id.toString() };
            savedIngredients.push(savedIngredient);
          }
        }

        payload = savedIngredients;
      } catch (e) {
        console.error(e);
        payload = [];
      } finally {
        console.log('[generateSavedIngredients] payload\t', payload);
        return payload;
      }
    }, */
    /*     getCategories: async () => await Category.find(),
    getRecipes: async () => await Recipe.find().populate({ path: 'ingredients', populate: 'category' }) */
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
        if (!user) throw new Error('User not created');
        user.save();
        token = signToken(user);
      } catch (e) {
        console.error(e);
      }
      return { token, user };
    },

    // makes a user pro
    makeUserPro: async (_, __, context) => {
      let user = false;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');
        user = await User
          //
          .findByIdAndUpdate(context.user._id, { $set: { pro: true } }, { new: true })
          .select('pro');
        if (!user) throw new Error('User not found, please log in');
        pro = true;
      } catch (error) {
        console.error(error);
      }
      console.log('[makeUserPro] user\t', user);
      return user;
    },

    // saves a recipe to the database
    saveRecipe: async (_, args, context) => {
      try {
        console.log('[saveRecipe]');
        // console.log('[saveRecipe] args', args);
        const { input } = args;
        const { name, portions, ingredients, picture_url, edamamId } = input;
        payload = null;

        console.log('[saveRecipe]');
        // console.log('input', input);
        // console.log('context.user', await context.user);

        if (!context.user) throw new AuthenticationError('Not logged in!');
        const uniqueCategories = await Category.find()
          .select('-_id name')
          .then((categories) => categories.map((c) => c.name));

        const createdIngredients = [];
        for (let { name, quantity, measure, category } of ingredients) {
          if (!name) name = 'Generic';
          if (!quantity) quantity = 1;
          if (!measure) measure = 'unit';
          if (!category) category = 'Generic';

          // find or create category
          let categoryId;
          if (!uniqueCategories.includes(category)) {
            uniqueCategories.push(category);
            // new category to create
            let createdCategory = await Category.create({ name: category });
            createdCategory.save();
            categoryId = createdCategory._id;
          } else {
            let foundCategory = await Category.findOne({ name: category });
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
        const newRecipe = { name, portions, ingredients: createdIngredients, picture_url: picture_url || createdImage, edamamId: edamamId };
        // console.log('newRecipe', newRecipe);
        const recipe = await Recipe
          //
          .create(newRecipe)
          .then((recipe) => recipe.populate({ path: 'ingredients', populate: 'category' }));

        // push recipe to user.savedRecipes
        const query = context.user._id;
        // console.log('[saveRecipe] context.user._id', context.user._id);
        if (!query) throw new Error('No user found');
        const update = { $push: { savedRecipes: recipe._id } };
        const user = await User.findByIdAndUpdate(query, update, { new: true });
        if (!user) throw new Error('User not found, please log in');
        console.log('user.savedRecipes:', user.savedRecipes);
        payload = recipe;
      } catch (error) {
        console.log(error);
      }
      // console.log('[saveRecipe] payload\t', payload);
      return payload;
    },

    // updates a recipe in the database
    updateRecipe: async (_, { recipeId, input: { name, portions, picture_url, ingredients, edamamId } }, context) => {
      console.log('[updateRecipe] REQ\t', recipeId, { name, portions, picture_url, ingredients, edamamId });
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');

        const dbRecipe = await Recipe.findById(recipeId);
        if (!dbRecipe) throw new Error('Recipe does not exist!');
        console.log('[updateRecipe] db Rec\t', dbRecipe);
        // delete all ingredients in this recipe from database
        for (const { _id } of dbRecipe.ingredients) {
          const deleteResult = await Ingredient.findByIdAndDelete(_id);
          console.log('[updateRecipe] del Ing\t', deleteResult);
        }
        // remove all ingredient references in recipe
        const clearedRecipe = await Recipe.findByIdAndUpdate(recipeId, { $set: { ingredients: [] } }, { new: true });
        console.log('[updateRecipe] upd Rec\t', clearedRecipe);

        const uniqueCategories = await Category
          //
          .find()
          .select('-_id name')
          .then((categories) => categories.map((c) => c.name));
        console.log('[updateRecipe] DB Cat\t', uniqueCategories);

        const createdIngredients = [];
        for (let { name, quantity, measure, category } of ingredients) {
          console.log('[updateRecipe] REQ Ing\t', { name, quantity, measure, category });

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
            console.log('[updateRecipe] created\t', createdCategory);
            categoryId = createdCategory._id;
          } else {
            let foundCategory = await Category.findOne({ name: category });
            console.log('[updateRecipe] found \t', foundCategory);
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
          console.log('[updateRecipe] createdIngredient\t', createdIngredient);
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
        dbRecipe.edamamId = edamamId;
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
        console.log('[updateRecipe] used Cat\t', usedCategories);
        const allCategories = await Category.find()
          .select('_id')
          .then((arr) => arr.map((val) => val._id));
        console.log('[updateRecipe] all Cat\t', allCategories);

        const result = await Category.deleteMany({ _id: { $nin: usedCategories } });
        console.log('[updateRecipe] del Cat\t', result);
        console.log('[updateRecipe] payload\t', dbRecipe);
        return dbRecipe;
      } catch (error) {
        console.error(error);
      }
    },

    // removes a recipe from the database
    removeRecipe: async (_, { recipeId }, context) => {
      console.log('[removeRecipe] REQ id\t', recipeId);
      payload = null;
      try {
        if (!context.user) throw new AuthenticationError('Not logged in!');
        const dbRecipe = await Recipe.findById(recipeId);
        if (!dbRecipe) throw new Error('Recipe does not exist!');
        console.log('[removeRecipe] db Rec\t', dbRecipe);
        // delete all ingredients in this recipe from database
        for (const { _id } of dbRecipe.ingredients) {
          const deleteResult = await Ingredient.findByIdAndDelete(_id);
          console.log('[removeRecipe] del Ing\t', deleteResult);
        }
        // remove all ingredient references in recipe
        const clearedRecipe = await Recipe.findByIdAndUpdate(recipeId, { $set: { ingredients: [] } }, { new: true });
        console.log('[removeRecipe] upd Rec\t', clearedRecipe);

        // delete Recipe
        const delRecipe = await Recipe.findByIdAndDelete(recipeId);
        console.log('[removeRecipe] del rec\t', delRecipe);

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
        console.log('[removeRecipe] used Cat\t', usedCategories);
        const allCategories = await Category.find()
          .select('_id')
          .then((arr) => arr.map((val) => val._id));
        console.log('[removeRecipe] all Cat\t', allCategories);

        const result = await Category.deleteMany({ _id: { $nin: usedCategories } });
        console.log('[removeRecipe] del Cat\t', result);

        // remove recipe from user.savedRecipes
        console.log('context.user._id', context.user._id);
        const user = await User.findByIdAndUpdate(context.user._id, { $pull: { savedRecipes: recipeId } }, { new: true });
        if (!user) throw new Error('User not found, please log in');
        payload = true;
      } catch (error) {
        payload = false;
        console.error(error);
      } finally {
        console.log('[removeRecipe] payload\t', payload);
        return payload;
      }
    },

    //
    login: async (_, args) => {
      try {
        if (!args) throw new Error('No arguments were received');
        if (!args.email) throw new Error('No email argument was received');
        if (!args.password) throw new Error('No password argument was received');

        const { email } = args;
        const user = await User.findOne({ email });
        if (!user) throw new AuthenticationError('Incorrect credentials');

        const { password } = args;
        const isCorrectPassword = await user.isCorrectPassword(password);
        if (!isCorrectPassword) throw new AuthenticationError('Incorrect credentials');

        const token = signToken(user);
        const payload = { token, user };
        return payload;
      } catch (e) {
        console.error('[login][error]' + e);
      }
    }
  }
};

module.exports = resolvers;
