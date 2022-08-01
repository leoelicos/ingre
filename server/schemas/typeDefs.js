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

  type Mutation {
    #
    addUser(input: UserInput!): Auth
    addRecipe(input: RecipeInput!): [Recipe]
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
