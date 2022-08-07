/*
 * ingre
 * server/schemas/typeDefs.js
 * This script contains typeDefs for graphQL schema
 * Copyright 2022 Leo Wong
 */

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID!
    firstName: String
    lastName: String
    email: String
    #  password: String
    savedRecipes: [Recipe]
    libraryRecipes: [Recipe]
    orders: [Order]
  }

  input UserInput {
    firstName: String
    lastName: String
    email: String
    password: String
    savedRecipes: [String]
    libraryRecipes: [String]
    orders: [String]
  }

  type Recipe {
    _id: ID!
    name: String
    portions: Int
    ingredients: [Ingredient]
    picture_url: String
  }

  input RecipeInput {
    name: String
    portions: Int
    ingredients: [String]
    picture_url: String
  }
  type Ingredient {
    _id: ID
    name: String
    quantity: Float
    measure: String
    text: String
    category: Category
  }

  input IngredientInput {
    name: String
    quantity: Float
    measure: String
    text: String
    category: String
  }

  type Category {
    _id: ID
    name: String
  }

  type Product {
    _id: ID
    name: String
    description: String
    image: String
    quantity: Int
    price: Float
  }
  type Order {
    _id: ID
    purchaseDate: String
    products: [Product]
  }
  type Checkout {
    session: ID
  }

  type Auth {
    token: ID
    user: User
  }

  type Query {
    getUser: User
    getRecipes: [Recipe]
    getRecipe(_id: ID!): Recipe
    getIngredients(category: ID): [Ingredient]
    getIngredient(_id: ID!): Ingredient
    getOrder(_id: ID!): Order
    #
    getCategories: [Category]
    getCategory(_id: ID!): Category
    getProducts: [Product]
    getProduct(_id: ID!): Product
    #
    checkout(products: [ID!]): Checkout
  }

  input EdamamAPIInput {
    q: String
    diet: [String]
    # balanced high-fiber high-protein low-carb low-fat low-sodium
    health: [String]
    # alcohol-cocktail alcohol-free celery-free crustacean-free dairy-free DASH egg-free fish-free fodmap-free gluten-free immuno-supportive keto-friendly kidney-friendly kosher low-fat-abs low-potassium low-sugar lupine-free Mediterranean mollusk-free mustard-free no-oil-added paleo peanut-free pescatarian pork-free red-meat-free sesame-free shellfish-free soy-free sugar-conscious sulfite-free tree-nut-free vegan vegetarian wheat-free
    cuisineType: [String]
    # American Asian British Caribbean Central Europe Chinese Eastern Europe French Indian Italian Japanese Kosher Mediterranean Mexican Middle Eastern Nordic South American South East Asian
    mealType: [String]
    # Breakfast Dinner Lunch Snack Teatime
    dishType: [String]
    # Biscuits and cookies Bread Cereals Condiments and sauces Desserts Drinks Main course Pancake Preps Preserve Salad Sandwiches Side dish Soup Starter Sweets
  }
  type Mutation {
    #
    addRandomRecipes(input: EdamamAPIInput): [Recipe]
    #
    addUser(input: UserInput!): Auth
    addRecipe(input: RecipeInput!): Recipe
    addIngredient(input: IngredientInput!): Ingredient
    addOrder(products: [ID]!): Order
    #
    updateUser(input: UserInput!): User
    updateRecipe(recipeID: ID!, input: RecipeInput!): Recipe
    #
    removeRecipe(recipeID: ID!): [Recipe]
    removeIngredient(ingredientID: ID!): [Ingredient]
    #
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
