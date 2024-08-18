import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    _id: ID
    firstName: String
    lastName: String
    email: String
    pro: Boolean
    savedRecipes: [Recipe]
    numSavedRecipes: Int
  }

  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  type Recipe {
    _id: ID
    name: String
    portions: Int
    ingredients: [Ingredient]
    picture_url: String
    edamamId: String
    instructions: String
  }

  input RecipeInput {
    name: String
    portions: Int
    ingredients: [IngredientInput]
    picture_url: String
    edamamId: String
    instructions: String
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

  type IngredientListItem {
    _id: ID
    name: String
    quantity: Float
    measure: String
    category: String
    recipe: String
    recipeId: ID
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
    session: String
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
    checkEmailAlreadyExists(email: String): Boolean
    getApiKey: EdamamCredentials
    getUser: User
    getRecipe(_id: ID): Recipe
    getNumSavedRecipes: Int
    getSavedRecipes: [Recipe]
    checkout: Checkout
  }

  type Mutation {
    addUser(input: UserInput): Auth
    makeUserPro: User
    saveRecipe(input: RecipeInput): Recipe
    updateRecipe(recipeId: ID, input: RecipeInput): Recipe
    removeRecipe(recipeId: ID): Boolean
    login(email: String, password: String): Auth
  }
`;
