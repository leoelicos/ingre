require('dotenv').config({ path: '../.env' })

const { User, Recipe, Ingredient, Category } = require('../models')
const { signToken } = require('../utils/auth')
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc')
const APP_KEY = process.env.HEROKU_EDAMAM_APP_KEY || process.env.PRODUCTION_EDAMAM_APP_KEY
const APP_ID = process.env.HEROKU_EDAMAM_APP_ID || process.env.PRODUCTION_EDAMAM_APP_ID
let payload

const resolvers = {
  Query: {
    checkEmailAlreadyExists: async (_, args) => {
      console.log('[getUserWithEmail] REQ\t', args)
      try {
        const user = await User.findOne({ email: args.email })
        if (user) return true
        else return false
      } catch (error) {
        console.error(error)
      }
    },
    //
    getApiKey: () => ({ appId: APP_ID, appKey: APP_KEY }),
    //
    getUser: async (_, __, context) => {
      console.log('[getUser]')
      let user = null
      try {
        if (!context.user) throw 'Not logged in!'
        user = await User.findById(context.user._id)
        if (!user) throw 'Please log in'
        payload = user
      } catch (error) {
        console.error(error)
        payload = null
      } finally {
        return payload
      }
    },

    //
    getRecipe: async (_, args) => {
      console.log('[getRecipe]')
      const { _id } = args
      let recipe = null
      try {
        recipe = await Recipe.findById(_id).populate({ path: 'ingredients', populate: 'category' })
        payload = recipe
        return payload
      } catch (error) {
        console.error(error)
      }
    },

    //
    getSavedRecipes: async (_, __, context) => {
      try {
        console.log('[getSavedRecipes]')
        if (!context.user) throw 'Not logged in!'
        const user = await User.findById(context.user._id).populate({ path: 'savedRecipes' })
        if (!user) throw 'User not found, please log in'
        payload = user.savedRecipes
      } catch (e) {
        console.error(e)
        payload = []
      } finally {
        return payload
      }
    },

    //
    getNumSavedRecipes: async (_, __, context) => {
      payload = 0
      try {
        if (!context.user) throw 'Not logged in!'
        const user = await User.findById(context.user._id)
        if (!user) throw 'User not found, please log in'
        payload = user.savedRecipes.length
      } catch (e) {
        console.error(e)
      } finally {
        return payload
      }
    },

    //
    checkout: async (_, __, context) => {
      console.log('[checkout]')
      let error = ''
      let id = ''
      try {
        const url = new URL(context.headers.referer).origin

        // array to store product metadata in Stripe
        const line_items = []

        const product = await stripe.products.create({
          name: 'ingré PRO',
          description: 'Access instructions to cook each recipe',
          images: [`https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc`]
        })

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 500,
          currency: 'usd'
        })

        line_items.push({ price: price.id, quantity: 1 })
        ;({ id } = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${url}/`
        }))
      } catch (e) {
        error = e
        console.error(e)
      }
      return { session: id, error }
    }
  },
  Mutation: {
    // adds a user to the database
    addUser: async (_, { input }) => {
      console.log('[addUser]')
      let user
      let token
      try {
        user = await User.create({ ...input })
        if (!user) throw 'User not created'
        user.save()
        token = signToken(user)
      } catch (e) {
        console.error(e)
      }
      return { token, user }
    },

    // makes a user pro
    makeUserPro: async (_, __, context) => {
      console.log('[makeUserPro]')
      let user = false
      try {
        if (!context.user) throw 'Not logged in!'
        user = await User
          //
          .findByIdAndUpdate(context.user._id, { $set: { pro: true } }, { new: true })
          .select('pro')
        if (!user) throw 'User not found, please log in'
        pro = true
      } catch (error) {
        console.error(error)
      }
      return user
    },

    // saves a recipe to the database
    saveRecipe: async (_, args, context) => {
      console.log('saveRecipe')
      try {
        console.log('[saveRecipe]')
        const { input } = args
        const { name, portions, ingredients, picture_url, edamamId, instructions } = input
        payload = null

        if (!context.user) throw 'Not logged in!'
        const uniqueCategories = await Category.find()
          .select('-_id name')
          .then((categories) => categories.map((c) => c.name))

        const createdIngredients = []
        for (let { name, quantity, measure, category } of ingredients) {
          if (!name) name = 'Generic'
          if (!quantity) quantity = 1
          if (!measure) measure = 'unit'
          if (!category) category = 'Generic'

          // find or create category
          let categoryId
          if (!uniqueCategories.includes(category)) {
            uniqueCategories.push(category)
            // new category to create
            let createdCategory = await Category.create({ name: category })
            createdCategory.save()
            categoryId = createdCategory._id
          } else {
            let foundCategory = await Category.findOne({ name: category })
            categoryId = foundCategory._id
          }

          // create ingredient
          let ingredient = await Ingredient.create({ name, quantity, measure, category: categoryId })
          ingredient.save()
          const ingredientId = ingredient._id

          createdIngredients.push(ingredientId)
        }
        // create recipe
        const createdImage = 'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
        const newRecipe = {
          name,
          portions,
          instructions,
          ingredients: createdIngredients,
          picture_url: picture_url || createdImage,
          edamamId: edamamId
        }
        const recipe = await Recipe
          //
          .create(newRecipe)
          .then((recipe) => recipe.populate({ path: 'ingredients', populate: 'category' }))

        // push recipe to user.savedRecipes
        const query = context.user._id
        if (!query) throw 'No user found'
        const update = { $push: { savedRecipes: recipe._id } }
        const user = await User.findByIdAndUpdate(query, update, { new: true })
        if (!user) throw 'User not found, please log in'
        payload = recipe
      } catch (error) {
        console.error(error)
      }
      return payload
    },

    // updates a recipe in the database
    updateRecipe: async (_, { recipeId, input: { name, portions, picture_url, ingredients, edamamId, instructions } }, context) => {
      console.log('[updateRecipe]')
      try {
        if (!context.user) throw 'Not logged in!'

        const dbRecipe = await Recipe.findById(recipeId)
        if (!dbRecipe) throw 'Recipe does not exist!'
        // delete all ingredients in this recipe from database
        for (const { _id } of dbRecipe.ingredients) {
          const deleteResult = await Ingredient.findByIdAndDelete(_id)
        }
        // remove all ingredient references in recipe
        const clearedRecipe = await Recipe.findByIdAndUpdate(recipeId, { $set: { ingredients: [] } }, { new: true })

        const uniqueCategories = await Category
          //
          .find()
          .select('-_id name')
          .then((categories) => categories.map((c) => c.name))

        const createdIngredients = []
        for (let { name, quantity, measure, category } of ingredients) {
          if (!name) name = 'Generic'
          if (!quantity) quantity = 1
          if (!measure) measure = 'unit'
          if (!category) category = 'Generic'

          // find or create category
          let categoryId
          if (!uniqueCategories.includes(category)) {
            uniqueCategories.push(category)
            let createdCategory = await Category.create({ name: category })
            createdCategory.save()
            categoryId = createdCategory._id
          } else {
            let foundCategory = await Category.findOne({ name: category })
            categoryId = foundCategory._id
          }

          // create ingredient
          const newIngredient = { name, quantity, measure, category: categoryId }
          let createdIngredient = await Ingredient.create(newIngredient)
          createdIngredient.save()
          createdIngredients.push(createdIngredient._id)
        }
        /* update recipe */
        const createdImage = 'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
        dbRecipe.name = name
        dbRecipe.portions = portions
        dbRecipe.ingredients = createdIngredients
        dbRecipe.picture_url = picture_url || createdImage
        dbRecipe.edamamId = edamamId
        dbRecipe.instructions = instructions
        await dbRecipe.save()
        dbRecipe.populate({ path: 'ingredients', populate: 'category' })

        // clean up categories
        const usedCategories = []
        await Recipe.find()
          .populate({ path: 'ingredients', populate: 'category' })
          .select('ingredients')
          .then((recipes) => {
            recipes.forEach((recipe) => {
              recipe.ingredients.forEach((i) => {
                const c = i.category
                if (!usedCategories.includes(c._id)) usedCategories.push(c._id)
              })
            })
          })
        const allCategories = await Category.find()
          .select('_id')
          .then((arr) => arr.map((val) => val._id))

        const result = await Category.deleteMany({ _id: { $nin: usedCategories } })
        return dbRecipe
      } catch (error) {
        console.error(error)
      }
    },

    // removes a recipe from the database
    removeRecipe: async (_, { recipeId }, context) => {
      console.log('[removeRecipe] REQ id\t', recipeId)
      payload = null
      try {
        if (!context.user) throw 'Not logged in!'
        const dbRecipe = await Recipe.findById(recipeId)
        if (!dbRecipe) throw 'Recipe does not exist!'

        // delete all ingredients in this recipe from database
        for (const { _id } of dbRecipe.ingredients) {
          const deleteResult = await Ingredient.findByIdAndDelete(_id)
        }
        // remove all ingredient references in recipe
        const clearedRecipe = await Recipe.findByIdAndUpdate(recipeId, { $set: { ingredients: [] } }, { new: true })

        // delete Recipe
        const delRecipe = await Recipe.findByIdAndDelete(recipeId)

        // clean up categories
        const usedCategories = []
        await Recipe.find()
          .populate({ path: 'ingredients', populate: 'category' })
          .select('ingredients')
          .then((recipes) => {
            recipes.forEach((recipe) => {
              recipe.ingredients.forEach((i) => {
                const c = i.category
                if (!usedCategories.includes(c._id)) usedCategories.push(c._id)
              })
            })
          })
        const allCategories = await Category.find()
          .select('_id')
          .then((arr) => arr.map((val) => val._id))

        const result = await Category.deleteMany({ _id: { $nin: usedCategories } })

        // remove recipe from user.savedRecipes
        const user = await User.findByIdAndUpdate(context.user._id, { $pull: { savedRecipes: recipeId } }, { new: true })
        if (!user) throw 'User not found, please log in'
        payload = true
      } catch (error) {
        payload = false
        console.error(error)
      } finally {
        return payload
      }
    },

    //
    login: async (_, args) => {
      try {
        if (!args) throw 'No arguments were received'
        if (!args.email) throw 'No email argument was received'
        if (!args.password) throw 'No password argument was received'

        const { email } = args
        const user = await User.findOne({ email })
        if (!user) {
          throw 'Incorrect credentials'
          // we can probably handle this better
        }

        const { password } = args
        const isCorrectPassword = await user.isCorrectPassword(password)
        if (!isCorrectPassword) {
          throw 'Incorrect credentials'
          // we can probably handle this better
        }

        const token = signToken(user)
        const payload = { token, user }
        return payload
      } catch (e) {
        console.error('[login][error]' + e)
        return null // for now
      }
    }
  }
}

module.exports = resolvers
