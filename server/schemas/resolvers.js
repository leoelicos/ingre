/*
 * ingre
 * server/schemas/resolvers.js
 * This script contains resolvers for graphQL schema
 * Copyright 2022 Leo Wong
 */
const { AuthenticationError } = require('apollo-server-express');
const { User, Recipe, Ingredient, Category, Order, Product } = require('../models');
const { signToken } = require('../utils/auth');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const ObjectID = require('mongoose').Types.ObjectId;
const authThrow = (text) => {
  throw new AuthenticationError(text);
};
const axios = require('axios');

const resolvers = {
  Query: {
    getUser: async (_, __, context) => {
      // console.log('context.user = ', context.user);
      if (!context.user) authThrow('Not logged in!');
      return await User.findById(context.user._id)
        // populate each list
        .populate([
          {
            path: 'savedRecipes',
            populate: {
              path: 'ingredients',
              populate: 'category'
            }
          },
          {
            path: 'libraryRecipes',
            populate: {
              path: 'ingredients',
              populate: 'category'
            }
          },
          {
            path: 'orders',
            populate: 'products'
          }
        ]);
    },

    getRecipes: async () => {
      console.log('getRecipes was called');
      return await Recipe.find().populate({
        path: 'ingredients',
        populate: 'category'
      });
    },
    //
    getRecipe: async (_, { _id }) =>
      await Recipe.findById(_id).populate({
        path: 'ingredients',
        populate: 'category'
      }),
    //
    getIngredients: async (_, { category }) => {
      const params = {};
      if (category) params.category = ObjectID(category);
      const ingredients = await Ingredient.find(params).populate('category');
      return ingredients;
    },
    //
    getIngredient: async (_, { _id }) => await Ingredient.findById(_id),
    //
    getOrder: async (_, { _id }, context) => {
      if (!context.user) authThrow('Not logged in!');

      const user = await User
        // find one user with this ID
        .findById(context.user._id);

      // populate category for each ordered product
      console.log('user = ', user);
      return user.orders.id(_id);
    },
    //
    getCategories: async () => await Category.find(),
    //
    getCategory: async (_, { _id }) => await Category.findById(_id),
    //
    getProducts: async () => await Product.find(),
    //
    getProduct: async (_, { _id }) => await Product.findById(_id),
    //
    //
    checkout: async (_, args, context) => {
      console.log('args = ', args);
      const url = new URL(context.headers.referer).origin;
      const order = new Order({ products: args.products });

      // array to store product metadata in Stripe
      const line_items = [];

      const { products } = await order.populate('products');

      for (let i = 0; i < products.length; i++) {
        const product = await stripe.products.create({
          name: products[i].name,
          description: products[i].description,
          images: [`${url}/images/${products[i].image}`]
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: products[i].price * 100,
          currency: 'usd'
        });

        line_items.push({ price: price.id, quantity: 1 });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/`
        // back-end testing only
        // success_url: `https://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}`,
        // cancel_url: `https://localhost:3001/`
      });

      return { session: session.id };
    }
    //
  },
  Mutation: {
    addRandomRecipes: async (_, __, context) => {
      // debounce
      // call api
      console.log('api was called');
      const search = await axios.get(`https://api.edamam.com/api/recipes/v2?type=public&beta=false&q=Delicious&app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0&diet=balanced&health=vegetarian&cuisineType=Italian&mealType=Dinner&dishType=Main%20course&imageSize=LARGE&random=true`);
      const hits = search.data.hits;
      // serialize
      const serialized = hits.map(({ recipe }) => ({
        label: recipe.label,
        yield: recipe.yield,
        image: recipe.image,
        ingredients: recipe.ingredients.map((ingredient) => ({
          name: ingredient.food,
          quantity: ingredient.quantity,
          measure: ingredient.measure,
          category: ingredient.foodCategory,
          text: ingredient.text
        }))
      }));

      // create categories and ingredients
      const uniqueCategories = [];
      const currentCategories = await Category.find();
      for (const category of currentCategories) {
        uniqueCategories.push(category.name);
      }
      const createdRecipes = [];
      for (const recipe of serialized) {
        const createdIngredients = [];
        for (const ingredient of recipe.ingredients) {
          let { name, quantity, measure, text, category } = ingredient;
          if (!category) category = 'General';
          if (!name) name = 'Generic';
          if (!uniqueCategories.includes(category)) {
            uniqueCategories.push(category);
            await Category.create({ name: category });
          }
          const { _id } = await Category.findOne({ name: category });
          const createdIngredient = await Ingredient.create({
            name,
            quantity,
            measure,
            text,
            category: _id
          });
          createdIngredients.push(createdIngredient._id);
        }
        // create recipes
        const createdRecipe = await Recipe.create({
          name: recipe.label,
          yield: recipe.yield,
          ingredients: createdIngredients,
          picture_url: recipe.image
        });
        createdRecipes.push(createdRecipe._id);
      }
      return Recipe.find().populate({
        path: 'ingredients',
        populate: 'category'
      });
    },
    //
    addUser: async (_, { input }) => {
      console.log('Data to create new user: ', input);
      const user = await User.create({ ...input });
      const token = signToken(user);

      return { token, user };
    },
    //
    addRecipe: async (_, { input }, context) => {
      if (!context.user) authThrow('Not logged in!');
      const recipe = await Recipe.create({ ...input });

      return await recipe.populate({
        path: 'ingredients',
        populate: 'category'
      });
    },
    //
    addIngredient: async (_, { input }, context) => {
      if (!context.user) authThrow('Not logged in!');

      const { category } = input;
      const categoryExists = await Category.findById(category);
      if (!categoryExists) throw new Error(`category ${category} does not exist`);

      const ingredient = await Ingredient.create({ ...input });
      return ingredient.populate('category');
    },
    //
    addOrder: async (_, { products }, context) => {
      if (!context.user) authThrow('Not logged in!');
      for (const product of products) {
        const productExists = await Product.findById(product);
        if (!productExists) throw new Error('product does not exist');
      }
      const order = await new Order({ products }).populate('products');
      await User.findByIdAndUpdate(
        // find user with id and push the order to its order history
        context.user._id,
        { $push: { orders: order } }
      );
      return order;
    },
    //
    updateUser: async (_, { input }, context) => {
      if (!context.user) authThrow('Not logged in!');
      const query = context.user._id;
      const update = { ...input };
      const options = { new: true, runValidators: true };
      const user = await User.findByIdAndUpdate(query, update, options);
      return user.populate([
        {
          path: 'savedRecipes',
          populate: {
            path: 'ingredients',
            populate: 'category'
          }
        },
        {
          path: 'libraryRecipes',
          populate: {
            path: 'ingredients',
            populate: 'category'
          }
        },
        {
          path: 'orders',
          populate: 'products'
        }
      ]);
    },
    //
    updateRecipe: async (_, { recipeID, input }, context) => {
      if (!context.user) authThrow('Not logged in!');
      const recipeExists = await Recipe.findById(recipeID);
      if (!recipeExists) throw new Error('Recipe does not exist');
      const query = recipeID;
      const update = { ...input };
      const options = { new: true };
      return await Recipe.findByIdAndUpdate(query, update, options).populate({
        path: 'ingredients',
        populate: 'category'
      });
    },
    //
    removeRecipe: async (_, { recipeID }, context) => {
      if (!context.user) authThrow('Not logged in!');

      const recipeExists = await Recipe.findById(recipeID);
      if (!recipeExists) throw new Error('Recipe does not exist');

      await Recipe.findByIdAndDelete(recipeID);
      return await Recipe.find().populate({
        path: 'ingredients',
        populate: 'category'
      });
    },
    //
    removeIngredient: async (_, { ingredientID }, context) => {
      if (!context.user) authThrow('Not logged in!');

      const ingredientExists = await Ingredient.findById(ingredientID);
      if (!ingredientExists) throw new Error('Ingredient does not exist');

      await Ingredient.findByIdAndDelete(ingredientID);
      return await Ingredient.find();
    },
    //
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) authThrow('Incorrect credentials!');

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) authThrow('Incorrect credentials!');

      const token = signToken(user);

      console.log(token ? `Login successful:\n[firstName] ${user.firstName}\n[token] ${token}` : `Login unsuccessful.`);
      return { token, user };
    }
  }
};

module.exports = resolvers;
