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
    pro: Boolean
    savedRecipes: [Recipe]
  }

  input UserInput {
    firstName: String
    lastName: String
    email: String
    password: String
    pro: Boolean
  }

  type Recipe {
    _id: ID
    name: String
    portions: Int
    ingredients: [Ingredient]
    picture_url: String
  }

  input RecipeInput {
    name: String
    portions: Int
    ingredients: [IngredientInput]
    picture_url: String
  }
  type Ingredient {
    _id: ID
    name: String
    quantity: Float
    measure: String
    category: Category
  }

  input IngredientInput {
    name: String
    quantity: Float
    measure: String
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

  type Checkout {
    session: ID
  }

  type Auth {
    token: ID
    user: User
  }

  type EdamamCredentials {
    appId: String
    appKey: String
  }

  type Query {
    getUserWithEmail(email: String!): User
    getApiKey: EdamamCredentials
    getUser: User # Pages: State - firstName, lastName, pro
    getRecipe(_id: ID!): Recipe # Page: Saved - Edit button
    getSavedRecipes: [Recipe] # Page: Saved
    checkout: Checkout # Page: Saved
    # testing only
    getCategories: [Category]
    getIngredients: [Ingredient]
    getRecipes: [Recipe]
  }

  type Mutation {
    addUser(input: UserInput!): Auth # Page: Signup
    makeUserPro: User # Saved
    saveRecipe(input: RecipeInput!): Recipe # Pages: Home, Search, Custom
    updateRecipe(recipeId: ID!, input: RecipeInput!): Recipe # Page: Custom
    removeRecipe(recipeId: ID!): User # Page: Saved
    login(email: String!, password: String!): Auth # Page: Login
  }
`;

module.exports = typeDefs;
